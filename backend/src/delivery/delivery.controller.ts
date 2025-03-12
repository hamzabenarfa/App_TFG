import { Body, Controller, HttpCode, HttpException, HttpStatus, Post,Delete,Param,ParseIntPipe,Get,Put } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { GetCurrentUser } from 'src/common/decorators';
import { DeliveryStatus } from '@prisma/client';
import { GetCurrentUserId } from 'src/common/decorators';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}


  @Put(':id/arrive-at-depot')
  async conductorArrivesAtDepot(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: string,
  ) {
    return this.deliveryService.conductorArrivesAtDepot(id, +userId);
  }

  @Post('create')
  createDelivery(@Body() data){

    return this.deliveryService.createDelivery(data)
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteDelivery(@Param('id', ParseIntPipe) id: number) {
    return await this.deliveryService.deleteDelivery(id);
  }

  @Get(':id')
  async getDelivery(@Param('id', ParseIntPipe) id: number) {
    return this.deliveryService.getDeliveryById(id);  // Llama al servicio para obtener la entrega
  }

   // Obtener todos los camiones
   @Get()
   async getAllDelivery() {
     return this.deliveryService.getAllDelivery();
   }
   
   @Put(':id')
  async updateDelivery(
    @Param('id', ParseIntPipe) id,
    @Body() body: { status?: DeliveryStatus; clientId?: number; conductorId?: number; truckId?: number }
  ) {
    return this.deliveryService.updateDelivery(id, body);
  }

    // ✅ Ruta para el conductor
    @Put(':id/status/conductor')
    async conductorUpdateStatus(
      @Param('id', ParseIntPipe) id: number,
      @GetCurrentUserId() userId: string,
    ) {
      return this.deliveryService.conductorUpdateStatus(id, userId);
    }
  
    // ✅ Ruta para el cliente
    @Put(':id/status/cliente')
    async clientUpdateStatus(
      @Param('id', ParseIntPipe) id: number,
      @GetCurrentUserId() userId: string
    ) {
      return this.deliveryService.clientUpdateStatus(id, userId);
    }

}
