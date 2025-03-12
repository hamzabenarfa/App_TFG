import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { DeliveryStatus } from '@prisma/client';
import { MailerService } from 'src/mailer/mailer.service';


@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly mailerService: MailerService

  ) {}

  async conductorArrivesAtDepot(deliveryId: number, userId: number) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId },
    });
  
    if (!delivery) {
      throw new HttpException('Entregq no encontrada', HttpStatus.NOT_FOUND);
    }
  
    if (delivery.conductorId !== userId) {
      throw new HttpException('No tienes permiso para modificar este delivery', HttpStatus.FORBIDDEN);
    }
  
    // Guardar la hora de llegada del conductor al almacén
    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        arrivalAtDepot: new Date(), // 🕒 Guarda la fecha y hora actual
      },
    });
  
    return updatedDelivery;
  }
  

  async createDelivery(data) {
    const { truckId, clientId, conductorId } = data;
    const truckExist = await this.prisma.truck.findFirst({
      where: { id: +truckId },
    });

    if (!truckExist) {
      throw new HttpException('Camion no existe', HttpStatus.NOT_FOUND);
    }

    const activeDelivery = await this.prisma.delivery.findFirst({
      where: {
        truckId: +truckId,
        NOT: { status: 'sl3awoslt' },
      },
    });

    // if (activeDelivery) {
    //   throw new HttpException(
    //     'Este camión está ocupado en otra entrega',
    //     HttpStatus.CONFLICT,
    //   );
    // }

    const clientExist = await this.prisma.user.findFirst({
      where: { id: +clientId, role: 'CLIENT' },
    });

    if (!clientExist) {
      throw new HttpException(
        'Cliente no existe o el usuario no es Cliente ',
        HttpStatus.NOT_FOUND,
      );
    }

    const conductorExist = await this.prisma.user.findFirst({
      where: { id: parseInt(conductorId), role: 'CONDUCTEUR' },
    });

    if (!conductorExist) {
      throw new HttpException(
        'Conductor no existe o el usuario no es Conductor',
        HttpStatus.NOT_FOUND,
      );
    }

    //i5dmhom houni
    /**

    *ZEDT El get all ou update l delivery
    * cond update sl3a 5rjt //cest bon l cond ibdl ken ki tebda f depot ihotha kharjet
    * yji mail ll client li sl3a 5rjt  // andi mochkla fel logique mtaa l envoie de mail el beki mrigel, averifier la logique de lenvoie de mail hne ggdhdwa 
    * 
    * 
    * client yconfermi : update sl3a wolst //cest bon l cond ibdl ken ki tebda kharjet ihotha woslt
    * 
    * zeedt tasjil wakt f khrouj w wsoul ta kol status
    * zedt status ki youssel chauff
    * zedt fonction wakteh wsel l chauff lel mamal
    * 
    * 
    * 
    * Rakaht wahdy :
    * amalt formulaire html lel mail
    * rakaht ljoumal kol bel espanol
    * zedt mta l mdp oub
    * 
    * 

    */

    const deliveryCreated = await this.prisma.delivery.create({
      data: {
        truckId,
        clientId,
        conductorId,
      },
    });
    if (deliveryCreated) {
      throw new HttpException('Entrega creada', HttpStatus.CREATED);
    }
  }

  async deleteDelivery(id: number) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });

    if (!delivery) {
      throw new HttpException('Entrega no encontrada', HttpStatus.NOT_FOUND);
    }

    await this.prisma.delivery.delete({ where: { id } });

    return { message: 'Entrega eliminada correctamente' };
  }

    // Obtener todos los deliveries
  async getAllDelivery() {
    return await this.prisma.delivery.findMany();
  }

  async getDeliveryById(id) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id },
      include: {
        truck: true, 
        user: {
          select: {
            email: true,
            role: true,
            id: true,
          },
        },
        client: {
          select: {
            email: true,
            role: true,
            id: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new HttpException('Entrega no encontrada', HttpStatus.NOT_FOUND);
    }

    return delivery;
  }

  async updateDelivery(id, data: { status?: DeliveryStatus; clientId?: number; conductorId?: number; truckId?: number }) {
    const existingDelivery = await this.prisma.delivery.findFirst({ where: { id:+id } });

    if (!existingDelivery) {
      throw new HttpException('Entrega no encontrada', HttpStatus.NOT_FOUND);
    }

    // Verificar si el nuevo cliente, conductor o camión existen antes de actualizar
    if (data.clientId) {
      const clientExists = await this.prisma.user.findFirst({ where: { id: data.clientId, role: 'CLIENT' } });
      if (!clientExists) throw new HttpException('Cliente no válido', HttpStatus.BAD_REQUEST);
    }

    if (data.conductorId) {
      const conductorExists = await this.prisma.user.findFirst({ where: { id: data.conductorId, role: 'CONDUCTEUR' } });
      if (!conductorExists) throw new HttpException('Conductor no válido', HttpStatus.BAD_REQUEST);
    }

    if (data.truckId) {
      const truckExists = await this.prisma.truck.findFirst({ where: { id: data.truckId } });
      if (!truckExists) throw new HttpException('Camión no válido', HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.delivery.update({
      where: { id },
      data: {
        status: data.status,
        clientId: data.clientId,
        conductorId: data.conductorId,
        truckId: data.truckId,
      },
    });
  }

  // ✅ Conductor solo puede cambiar el estado de sl3aflDepot → sl3a5arjt → sel3awoslotkodemclient
  async conductorUpdateStatus(deliveryId: number, userId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId },
      include: { client: true }, // Para acceder al correo del cliente
    });

    if (!delivery) {
      throw new HttpException('Entrega no encontrada', HttpStatus.NOT_FOUND);
    }

    if (delivery.conductorId !== +userId) {
      throw new HttpException('No tienes permiso para modificar este delivery', HttpStatus.FORBIDDEN);
    }

    let updatedDelivery;

    if (delivery.status === DeliveryStatus.sl3aflDepot) {
      // Cambiar estado a "sl3a5arjt" y registrar la hora de salida
      updatedDelivery = await this.prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.sl3a5arjt,
          dispatchedAt: new Date(),
        },
      });

      // Enviar email al cliente
      await this.mailerService.sendMail(
        delivery.client.email,
        'Confirmación de salida del producto',
        'Estimado cliente, su producto ha salido y está en camino. Gracias por confiar en nosotros.',
        'https://miapp.com/seguimiento',
        'Seguir mi pedido'
      );

    } else if (delivery.status === DeliveryStatus.sl3a5arjt) {
      // Cambiar estado a "sel3awoslotkodemclient" y registrar la hora de entrega
      updatedDelivery = await this.prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.sel3awoslotkodemclient,
          livredAtCond: new Date(),
        },
      });

      // Enviar email al cliente notificando la entrega

      await this.mailerService.sendMail(
        delivery.client.email,
        'Pedido en el local, pendiente de entrega',
        'Estimado cliente, su pedido ha llegado a su local y está pendiente de entrega. ¡Gracias por su paciencia!',
      );

    } else {
      throw new HttpException('No puedes cambiar el estado desde el estado actual', HttpStatus.FORBIDDEN);
    }

    return updatedDelivery;
  }

    // ✅ Cliente solo puede cambiar de sl3a5arjt a sl3awoslt
  // ✅ Cliente solo puede cambiar el estado de sel3awoslotkodemclient → sl3awoslt
  async clientUpdateStatus(deliveryId: number, userId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id: deliveryId },
      include: { client: true }, // Para acceder al correo del cliente
    });

    if (!delivery) {
      throw new HttpException('Entrega no encontrada', HttpStatus.NOT_FOUND);
    }

    if (delivery.clientId !== +userId) {
      throw new HttpException('No tienes permiso para modificar este delivery', HttpStatus.FORBIDDEN);
    }

    let updatedDelivery;

    if (delivery.status === DeliveryStatus.sel3awoslotkodemclient) {
      // Cambiar estado a "sl3awoslt" y registrar la hora de entrega
      updatedDelivery = await this.prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.sl3awoslt,
          livredAtClient: new Date(),
        },
      });

      // Enviar email al cliente
      await this.mailerService.sendMail(
        delivery.client.email,
        'Pedido entregado con éxito',
        'Estimado cliente, su pedido ha sido entregado con éxito. ¡Gracias por su compra!',
        'https://miapp.com/soporte',
        'Contactar soporte'
      );
    } else {
      throw new HttpException(
        'Solo puedes cambiar el estado desde sel3awoslotkodemclient',
        HttpStatus.FORBIDDEN
      );
    }

    return updatedDelivery;
  }

}
