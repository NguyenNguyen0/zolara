import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ContactService } from './contact.service';
import { SyncContactsDto } from './dto/sync-contacts.dto';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('sync')
  async syncContacts(
    @Request() req: Request,
    @Body() syncContactsDto: SyncContactsDto,
  ) {
    const userId = req['user'].sub;
    return this.contactService.syncContacts(userId, syncContactsDto.contacts);
  }

  @Get()
  async getUserContacts(@Request() req: Request) {
    const userId = req['user'].sub;
    return this.contactService.getUserContacts(userId);
  }
}
