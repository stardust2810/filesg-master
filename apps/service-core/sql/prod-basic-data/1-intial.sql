INSERT INTO agency (`id`, `uuid`, `name`, `status`, `code`) VALUES (1, 'agency-1667879504467-7af6b0f4f825a18a', 'Immigration & Checkpoints Authority', 'active', 'ICA');

INSERT INTO eservice (`id`, `uuid`, `name`, `email`, `agencyId`) VALUES (1, 'eservice-1667879536309-f5665f7c45cdce21', 'CIRIS', 'filesgsqa+devica@gmail.com', 1);
INSERT INTO eservice (`id`, `uuid`, `name`, `email`, `agencyId`) VALUES (2, 'eservice-1667879536320-4981762d61a4b9a0', 'MyICA', 'filesgsqa+devica@gmail.com', 1);

INSERT INTO application_type (`id`, `uuid`, `name`, `code`) VALUES (1, 'applicationtype-1667879607950-15ce443258bebe65', 'Long Term Visit Pass', 'LTVP')
INSERT INTO application_type (`id`, `uuid`, `name`, `code`) VALUES (2, 'applicationtype-1667879302790-f024ba1d9bd2490d', 'Student Pass', 'STP')
INSERT INTO application_type (`id`, `uuid`, `name`, `code`) VALUES (3, 'applicationtype-1667879302800-5342b6ed7c259794', 'Dependant Pass', 'DP')

INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (1, 1)
INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (1, 2)
INSERT INTO eservice_application_type (`eserviceId`, `applicationTypeId`) VALUES (1, 3)