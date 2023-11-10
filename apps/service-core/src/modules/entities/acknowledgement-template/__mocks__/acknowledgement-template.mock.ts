import { AcknowledgementTemplate, AcknowledgementTemplateCreationModel } from '../../../../entities/acknowledgement-template';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockAcknowledgementTemplate = (args: TestCreationModel<AcknowledgementTemplateCreationModel>) => {
  const activity = new AcknowledgementTemplate();

  args.uuid && (activity.uuid = args.uuid);
  args.id && (activity.id = args.id);
  activity.content = args.content;
  activity.eservice = args.eservice;
  activity.activities = args.activities;
  args.eserviceId && (activity.eserviceId = args.eserviceId);

  return activity;
};
