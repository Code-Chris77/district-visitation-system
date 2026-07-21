import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { MembersService } from "./members.service";

@Controller("members")
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
  ) {}

  @Post()
  create(@Body() body: any) {
    return this.membersService.create(body);
  }

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.membersService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.membersService.remove(id);
  }
}
