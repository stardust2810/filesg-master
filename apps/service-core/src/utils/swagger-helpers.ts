export function generateExceptionsTableMarkdown(exceptions: Array<{ error: any; description: string }>) {
  const descriptionBase = ' errorCode | message | description \n |---|---|---|';
  return (
    descriptionBase +
    exceptions.map((exception) => `\n ${exception.error.errorCode} | ${exception.error.message} | ${exception.description}`).join('')
  );
}
