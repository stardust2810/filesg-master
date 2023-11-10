import { forwardRef } from 'react';

import { PASS_NAME } from '../../../../const';
import { LtpPass } from '../../../../typings';
import { convertToCustomDateString } from '../../../../utils';
import identityCardBase from '../../assets/images/green-identity-card-base-4x.png';
import invalidWatermark from '../../assets/images/invalid-watermark-4x.png';
import lionCrestWatermark from '../../assets/images/lion-crest-watermark-4x.png';
import coatOfArms from '../../assets/images/sg-coat-of-arms-4x.png';
import { Field } from './components/field';
import {
  CoatOfArms,
  Container,
  ContentContainer,
  FieldsContainer,
  ImageContainer,
  InvalidWatermark,
  LionCrestWatermark,
  ProfileImage,
  ROSTitle,
  StyledBottomText,
  Title,
} from './style';

type Props = {
  title: PASS_NAME;
  document: LtpPass;
  backgroundImage?: string;
  profileImage: string;
  showFullDetails?: boolean;
  showWatermark?: boolean;
} & { className?: string };

const MASKED_VALUE = '\u2022'.repeat(12);

export const IdentityCard = forwardRef<HTMLDivElement, Props>(
  (
    { title, document, backgroundImage = identityCardBase, className, profileImage, showFullDetails = true, showWatermark = false }: Props,
    ref,
  ) => {
    const { agencyData } = document;
    const { name, hanyupinyinName, fin, dob, sex, nationality, address, issuedOn, expireOn, plusInd, mjvInd } = agencyData;

    return (
      <Container className={className} backgroundImage={backgroundImage} ref={ref}>
        <ROSTitle>REPUBLIC OF SINGAPORE</ROSTitle>
        <Title>
          {title}
          {title === PASS_NAME.LTVP && plusInd && ' PLUS'}
        </Title>
        <CoatOfArms src={coatOfArms} />
        <ContentContainer>
          <ImageContainer>
            <ProfileImage src={`data:image/jpeg;base64,${profileImage}`} />
            <LionCrestWatermark src={lionCrestWatermark} />
          </ImageContainer>
          <FieldsContainer>
            <Field
              title="Name"
              value={
                <>
                  {name} <br /> {hanyupinyinName ? `(${hanyupinyinName})` : ''}
                </>
              }
            />
            <Field title="FIN" value={fin} />
            <Field title="Date of Birth" value={convertToCustomDateString(dob)} />
            <Field title="Sex" value={showFullDetails ? sex : MASKED_VALUE} />
            <Field title="Nationality / Citizenship" value={showFullDetails ? nationality : MASKED_VALUE} />
            <Field title="Pass Issue Date" value={convertToCustomDateString(issuedOn)} />
            <Field title="Pass Expiry Date" value={convertToCustomDateString(expireOn)} />
            <Field
              title="Address"
              value={
                showFullDetails
                  ? address.map((line, index) => (
                      <div key={`address-line-${index}`}>
                        {' '}
                        {line}
                        <br />
                      </div>
                    ))
                  : MASKED_VALUE
              }
            />
            {mjvInd && <StyledBottomText>MULTIPLE JOURNEY VISA ISSUED</StyledBottomText>}
          </FieldsContainer>
        </ContentContainer>
        {showWatermark && <InvalidWatermark src={invalidWatermark} />}
      </Container>
    );
  },
);
