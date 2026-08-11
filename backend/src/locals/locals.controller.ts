import { Controller, Get } from "@nestjs/common";
import { LocalsService } from "./locals.service";

@Controller("locals")
export class LocalsController {
  constructor(private readonly localsService: LocalsService) {}

  @Get()
  findAll() {
    return this.localsService.findAll();
  }
}
