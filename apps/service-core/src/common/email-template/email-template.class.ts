import { FuncArgs, TransactionalEmailTemplateTypes } from './email-factory.class';

export abstract class EmailTemplate {
  public generateEmail(args: FuncArgs[TransactionalEmailTemplateTypes]): { title: string; content: string } {
    return { title: this.generateEmailHeader(args), content: this.generateEmailContent(args) };
  }

  protected abstract generateEmailHeader(args: FuncArgs[TransactionalEmailTemplateTypes]): string;
  protected abstract generateEmailContent(args: FuncArgs[TransactionalEmailTemplateTypes]): string;
}
