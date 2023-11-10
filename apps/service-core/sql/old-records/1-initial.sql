INSERT INTO agency (`id`, `uuid`, `name`, `status`, `code`, `oaSigningKey`, `identityProofLocation`) VALUES (1, 'agency-acb1b43d-181f-4169-8376-c810e80e51d8', 'Government Technology Agency', 'active', 'GOVT', '0Jf5YVfG+n8jI1N79Rzmce/FOzrudi0haCNvgeQ+EBMbE6wgy3rjeYqDme+Dx8vAmfFeo08RMOEIDOwqbK3nHPCfksbR79LfrKTb0tc4VJA3/6Nqawh7/+fXZECRYu7j', 'dev.file.gov.sg');
INSERT INTO agency (`id`, `uuid`, `name`, `status`, `code`, `oaSigningKey`, `identityProofLocation`) VALUES (2, 'agency-3ef1e3bb-5550-4f43-af2f-b6a65593433c', 'Immigration & Checkpoints Authority', 'active', 'ICA', '0Jf5YVfG+n8jI1N79Rzmce/FOzrudi0haCNvgeQ+EBMbE6wgy3rjeYqDme+Dx8vAmfFeo08RMOEIDOwqbK3nHPCfksbR79LfrKTb0tc4VJA3/6Nqawh7/+fXZECRYu7j', 'dev.file.gov.sg');

INSERT INTO eservice (`id`, `uuid`, `name`, `email`, `agencyId`) VALUES (1, 'eservice-df747820-8f34-450e-889f-3f5c4f4e47ae', 'SupportGoWhere', 'filesgsqa+devica@gmail.com', 1);
INSERT INTO eservice (`id`, `uuid`, `name`, `email`, `agencyId`) VALUES (2, 'eservice-444fb139-182a-434a-8c6e-c4a2b359d26b', 'CIRIS', 'filesgsqa+devica@gmail.com', 2);
INSERT INTO eservice (`id`, `uuid`, `name`, `email`, `agencyId`) VALUES (3, 'eservice-c8de054c-f732-4189-9e46-9e88baf239be', 'MyICA', 'filesgsqa+devica@gmail.com', 2);

INSERT INTO application_type (`id`, `uuid`, `name`, `code`) VALUES (1, 'applicationType-29537a40-ca92-4e7f-9f7a-d8744829ade9', 'Long Term Visit Pass', 'LTVP')
INSERT INTO application_type (`id`, `uuid`, `name`, `code`) VALUES (2, 'applicationtype-1667879302790-f024ba1d9bd2490d', 'Student Pass', 'STP')
INSERT INTO application_type (`id`, `uuid`, `name`, `code`) VALUES (3, 'applicationtype-1667879302800-5342b6ed7c259794', 'Dependant Pass', 'DP')

INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (1, 1)
INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (3, 1)
INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (2, 1)
INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (2, 2)
INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (2, 3)

INSERT INTO application (`id`, `uuid`,  `eserviceId`, `externalRefId`, `applicationTypeId`) VALUES (1, 'application-e713f4db-9bce-4067-97eb-7a97648be0cd',  1, 'GOVT-LTVP-9533824d-2e55-4b8c-82a5-457dd24ee22b', 1);
INSERT INTO application (`id`, `uuid`,  `eserviceId`, `externalRefId`, `applicationTypeId`) VALUES (2, 'application-37528daa-12c9-49ee-b915-cf9f6bfca550',  3, 'ICA-LTVP-689f487c-1d3b-4e15-bc0e-29d88c897564', 1);

INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`) VALUES (1, 'citizenuser-0c48c8f6-c723-459b-a37a-629d557c1b95', 'a5UsyLyk0Aq5Tsj2iahmxmNdOBQ0PAKzjARpUxLWr3A=', 'Peter', 'peter@gmail.com', '+6581234567', 'citizen', true, 'active', 'CITIZEN');
INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`) VALUES (2, 'agencyuser-1f111d9a-776d-46e6-ab3d-e10762bd01d4', 'a5UsyLyk0Aq5Tsj2iahmxj2Cgy3ZO0B2pnmMfJ5gi0k=', 'Mary', 'mary@gmail.com', '+6581234567', 'agency', true, 'active', 'CITIZEN');

INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `type`, `isOnboarded`, `status`, `role`, `clientId`, `clientSecret`) VALUES (3, 'programmaticuser-06d95964-de61-4142-bbed-4898d0f0e16b', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_WRITE', 'client-uuid-1', '$argon2id$v=19$m=4096,t=3,p=1$fLAu8z0/tflo4xDsr/s38g$qehVc6tYcujtodmxb/+Ti993NGZ1uMqCM/8g1e53Jts');
INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `type`, `isOnboarded`, `status`, `role`, `clientId`, `clientSecret`) VALUES (6, 'programmaticuser-f2b10eef-4ec9-4b9f-b519-89d17ea10643', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_READ', 'client-uuid-2', '$argon2id$v=19$m=4096,t=3,p=1$fLAu8z0/tflo4xDsr/s38g$qehVc6tYcujtodmxb/+Ti993NGZ1uMqCM/8g1e53Jts');
INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `type`, `isOnboarded`, `status`, `role`, `clientId`, `clientSecret`) VALUES (7, 'programmaticuser-d0eed3a5-ff90-4aad-8906-5276d2bb4b64', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_READ', 'client-uuid-3', '$argon2id$v=19$m=4096,t=3,p=1$fLAu8z0/tflo4xDsr/s38g$qehVc6tYcujtodmxb/+Ti993NGZ1uMqCM/8g1e53Jts');
INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `type`, `isOnboarded`, `status`, `role`, `clientId`, `clientSecret`) VALUES (8, 'programmaticuser-919870dc-b403-4b48-8b59-9bef02c0dbe7', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_WRITE', 'client-uuid-4', '$argon2id$v=19$m=4096,t=3,p=1$fLAu8z0/tflo4xDsr/s38g$qehVc6tYcujtodmxb/+Ti993NGZ1uMqCM/8g1e53Jts');

INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`) VALUES (9, 'citizenuser-da2c8d9d-f2ee-430e-a39c-9d5abee84a7b', 'a5UsyLyk0Aq5Tsj2iahmxvuCxuaOgRSm16TOEVIdw+c=', 'MOCK NAME S3002610A', 'filesgsqa+devica1@gmail.com', '+6581234567', 'citizen', true, 'active', 'CITIZEN');
INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`) VALUES (10, 'citizenuser-39f360fc-4156-46f4-9346-ced153d790cf', 'a5UsyLyk0Aq5Tsj2iahmxl5fIffoGa/i/peWprBSXss=', 'MOCK NAME M7626570K', 'filesgsqa+devica2@gmail.com', '+6581234567', 'citizen', true, 'active', 'CITIZEN');
INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`) VALUES (11, 'citizenuser-b7d19669-0081-433f-aba3-5c01a8ec7330', 'a5UsyLyk0Aq5Tsj2iahmxtn5fmHoz2K3OscvwuqXjTM=', 'MOCK NAME S3002609H', 'filesgsqa+devica3@gmail.com', '+6581234567', 'citizen', true, 'active', 'CITIZEN');
INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`) VALUES (12, 'citizenuser-7c40123c-849e-4257-8c10-2e053a056d3a', 'a5UsyLyk0Aq5Tsj2iahmxrchAvXYLakqj/BrdBXL0p4=', 'MOCK NAME S3002607A', 'filesgsqa+devica4@gmail.com', '+6581234567', 'citizen', true, 'active', 'CITIZEN');

INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `type`, `isOnboarded`, `status`, `role`, `clientId`, `clientSecret`) VALUES (13, 'programmaticuser-919870dc-b403-4b48-8b59-9bef02c0dbe8', NULL, NULL, NULL, 'programmatic', true, 'active', 'SYSTEM', 'system-uuid-1', '$argon2id$v=19$m=4096,t=3,p=1$fLAu8z0/tflo4xDsr/s38g$qehVc6tYcujtodmxb/+Ti993NGZ1uMqCM/8g1e53Jts');

INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (1, 3);
INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (1, 6);
INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (2, 7);
INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (3, 8);
