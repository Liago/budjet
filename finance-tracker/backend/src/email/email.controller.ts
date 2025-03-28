import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { EmailService } from "./email.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

export type EmailTemplate = "test" | "transactions";

@ApiTags("email")
@Controller("email")
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("test")
  @ApiOperation({ summary: "Send a test email to the authenticated user" })
  @ApiResponse({ status: 200, description: "Test email sent successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async sendTestEmail(
    @Request() req,
    @Body() body: { template: EmailTemplate }
  ) {
    return this.emailService.sendTestEmail(req.user.email, body.template);
  }
}
