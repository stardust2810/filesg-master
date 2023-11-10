import { IssuedByAgencyContainer, IssuedByAgencyLogoImg,IssuedByAgencyName, IssuedByContainer, IssuedByTitle } from './style';

interface Props {
  agencyName: string;
  agencyLogo: string;
}

export function IssuedBy({ agencyName, agencyLogo}: Props) {
  return (
    <IssuedByContainer>
      <IssuedByTitle>Pass Issued by</IssuedByTitle>
      <IssuedByAgencyContainer>
        <IssuedByAgencyName>{agencyName}</IssuedByAgencyName>
        <IssuedByAgencyLogoImg src={agencyLogo} />
      </IssuedByAgencyContainer>
    </IssuedByContainer>
  );
}
