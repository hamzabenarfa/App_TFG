import { HttpException, HttpStatus,Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service'; // Ajusta la ruta según corresponda

@Injectable()
export class TruckService {
  constructor(private readonly prisma: DatabaseService) {}

  // Crear un nuevo camión
  async createTruck(plate: string, model: string) {
    // Verificar si el camión con la misma placa ya existe
    const existingTruck = await this.prisma.truck.findUnique({
      where: { plate },
    });
  
    if (existingTruck) {
      throw new HttpException('El camión con esta placa ya existe', HttpStatus.BAD_REQUEST);
    }
  
    // Si no existe, proceder a crear el camión
    return await this.prisma.truck.create({
      data: {
        plate,
        model,
      },
    });
  }

  // Obtener todos los camiones
  async getAllTrucks() {
    return await this.prisma.truck.findMany();
  }

  // Obtener un camión por ID
  async getTruckById(id) {
    const truck =  await this.prisma.truck.findUnique({
      where: { id:parseInt(id) },
    });
    if(!truck) {
        throw new HttpException('El camión no existe', HttpStatus.BAD_REQUEST);

    }
    return truck
        
  }

  // Actualizar un camión
  async updateTruck(id, plate: string, model: string) {
    const truckExist =  await this.prisma.truck.findUnique({
      where: { id:parseInt(id) },
    });
    if(!truckExist) {
        throw new HttpException('El camión no existe', HttpStatus.BAD_REQUEST);

    }
    return await this.prisma.truck.update({
      where: { id:+id},
      data: {
        plate,
        model,
      },
    });
    
  }

  // Eliminar un camión
  async deleteTruck(id) {
    const truckExist =  await this.prisma.truck.findUnique({
      where: { id:parseInt(id) },
    });
    if(!truckExist) {
        throw new HttpException('El camión no existe', HttpStatus.BAD_REQUEST);
    }
     await this.prisma.truck.delete({
      where: { id:+id },
    });

    return {message :"Camión eliminado"}
  }
}
