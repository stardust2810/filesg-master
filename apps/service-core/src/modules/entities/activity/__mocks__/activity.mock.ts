import { Activity, ActivityCreationModel } from '../../../../entities/activity';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockActivity = (args: TestCreationModel<ActivityCreationModel>) => {
  const activity = new Activity();

  args.uuid && (activity.uuid = args.uuid);
  args.id && (activity.id = args.id);
  activity.status = args.status;
  activity.type = args.type;
  args.recipientInfo && (activity.recipientInfo = args.recipientInfo);
  activity.children = args.children;
  activity.parent = args.parent;
  activity.fileAssets = args.fileAssets;
  activity.transaction = args.transaction;
  args.transactionId && (activity.transactionId = args.transactionId);
  activity.user = args.user;
  args.userId && (activity.userId = args.userId);
  args.isAcknowledgementRequired && (activity.isAcknowledgementRequired = args.isAcknowledgementRequired);
  activity.acknowledgedAt = args.acknowledgedAt ?? null;
  activity.acknowledgementTemplate = args.acknowledgementTemplate;
  args.isBannedFromNonSingpassVerification && (activity.isBannedFromNonSingpassVerification = args.isBannedFromNonSingpassVerification);
  args.isNonSingpassRetrievable && (activity.isNonSingpassRetrievable = args.isNonSingpassRetrievable);

  return activity;
};
