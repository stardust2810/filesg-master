INSERT INTO agency (`id`, `uuid`, `name`, `status`, `code`, `oaSigningKey`, `identityProofLocation`) VALUES (3, 'agency-1690875714899-e2e5ca68098ec84d', 'FormSG', 'active', 'FORM', '0Jf5YVfG+n8jI1N79Rzmce/FOzrudi0haCNvgeQ+EBMbE6wgy3rjeYqDme+Dx8vAmfFeo08RMOEIDOwqbK3nHPCfksbR79LfrKTb0tc4VJA3/6Nqawh7/+fXZECRYu7j', 'fsg.dev.file.gov.sg');

INSERT INTO eservice (`id`, `uuid`, `name`, `emails`, `agencyId`) VALUES (3, 'eservice-1690875714899-517d2e8a66779ae9', 'FormsgEservice', 'filesgsqa+formsgEservice@gmail.com', 3);

INSERT INTO application_type (`id`, `uuid`, `name`, `code`, `eserviceId`) VALUES (5, 'applicationtype-1690875742587-4c5cd6c5f37b888f', 'Sample Form Issuance',  'SFI', 3);

INSERT INTO application_type_notification (`notificationChannel`, `applicationTypeId`) VALUES ('EMAIL', 5);
INSERT INTO application_type_notification (`notificationChannel`, `applicationTypeId`) VALUES ('SG_NOTIFY', 5);

INSERT INTO transaction_custom_message_template (`uuid`, `name`, `template`, `requiredFields`, `type`, `agencyId`, `integrationType`) VALUES ('transactioncustommessagetemplate-1690875742587-50df1fbbfbbda2a0', 'FORM-SFI',   '["{{paragraph1}}","{{paragraph2}}","{{paragraph3}}","{{paragraph4}}","{{paragraph5}}"]', 'paragraph1,paragraph2,paragraph3,paragraph4,paragraph5', 'ISSUANCE', 3, 'formsg');

INSERT INTO notification_message_template (`uuid`, `name`, `template`, `requiredFields`, `version`, `type`, `externalTemplateId`, `notificationChannel`, `agencyId`, `integrationType`) VALUES ('notificationmessagetemplate-1690875764428-7cf3dec4baac0adc', 'FORM-SFI+EMAIL','["{{paragraph1}}","{{paragraph2}}","{{paragraph3}}","{{paragraph4}}","{{paragraph5}}"]', 'paragraph1,paragraph2,paragraph3,paragraph4,paragraph5', 1, 'ISSUANCE', NULL, 'EMAIL', 3, 'formsg');

INSERT INTO notification_message_template (`uuid`, `name`, `template`, `requiredFields`, `version`, `type`, `externalTemplateId`, `notificationChannel`, `agencyId`, `integrationType`) VALUES ('notificationmessagetemplate-1690875764428-26397ea21900ba28', 'FORM-SFI+SG_NOTIFY','["{{paragraph1}}","{{paragraph2}}","{{paragraph3}}","{{paragraph4}}","{{paragraph5}}"]', 'paragraph1,paragraph2,paragraph3,paragraph4,paragraph5', 1, 'ISSUANCE', 'FILESG-SPF-01', 'SG_NOTIFY', 3, 'formsg' );

INSERT INTO user (`id`, `uuid`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`, `uin`, `clientId`, `clientSecret`) VALUES (5, 'programmaticuser-1690874974432-c7d4657745285d81', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_SYSTEM_INTEGRATION', NULL, 'programmaticuser-1690875074989-de131f30226e6060', '$argon2id$v=19$m=4096,t=3,p=1$ytaOU0pAW9juy6vQtfC05w$aWdsezlssOeRcs2Xh54xREZY3hHozItocYwfF9MkoUI'); -- secret:e64d94da49bf769cf409b77f9a77525d

INSERT INTO user (`id`, `uuid`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`, `uin`, `clientId`, `clientSecret`) VALUES (6, 'programmaticuser-1690875085486-a5346b08b3abbb1a', NULL, NULL, NULL, 'eservice', true, 'active', 'FORMSG', NULL, NULL, NULL);

INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (1, 5);
INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (3, 6);

INSERT INTO eservice_whitelisted_user (`id`, `email`,`eserviceUserId`) VALUES (1, 'filesgsqa+formsgUser@gmail.com', 6)
