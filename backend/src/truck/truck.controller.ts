import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TruckService } from './truck.service';

@Controller('truck')
export class TruckController {
  constructor(private readonly truckService: TruckService) {}

  // Crear un camión
  @Post('create')
  async createTruck(@Body() body) {
    const { plate, model } = body;
    return this.truckService.createTruck(plate, model);
  }

  // Obtener todos los camiones
  @Get()
  async getAllTrucks() {
    return this.truckService.getAllTrucks();
  }

  // Obtener un camión por ID
  @Get(':id')
  async getTruckById(@Param('id') id) {
    
    return this.truckService.getTruckById(id);
  }

  // Actualizar un camión
  @Put(':id')
  async updateTruck(
    @Param('id') id: number,
    @Body() body: { plate: string; model: string },
  ) {
    const { plate, model } = body;
    return this.truckService.updateTruck(id, plate, model);
  }

  // Eliminar un camión
  @Delete(':id')
  async deleteTruck(@Param('id') id: number) {
    return this.truckService.deleteTruck(id);
  }
}
