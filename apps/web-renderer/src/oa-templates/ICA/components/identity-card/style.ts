import styled from 'styled-components';

export const Container = styled.div<{ backgroundImage: string }>`
  position: relative;

  background-image: ${(props) => {
    return `url(${props.backgroundImage})`;
  }};

  overflow: hidden;

  background-size: cover;
  width: 100%;
  max-width: 22.4375rem;
  border-radius: 1rem;
  box-sizing: border-box;

  font-family: 'Montserrat';
  font-weight: 600;
`;

export const ROSTitle = styled.div`
  color: #363636;
  font-size: 0.8125rem;
  line-height: 1rem;

  margin: 0.5rem 0 0.25rem 1rem;
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  height: 20px;

  font-size: 0.5625rem;
  line-height: 0.75rem;
  color: #363636;
  text-transform: uppercase;

  padding: 0 1rem;

  background-color: #e6fcf8;
  box-sizing: border-box;

  border-bottom: 1px solid;
`;

export const CoatOfArms = styled.img`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;

  width: 57px;
  height: 48px;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 1rem;
`;

export const ImageContainer = styled.div`
  position: relative;

  min-width: 86px;
  max-width: 86px;
  height: fit-content;

  padding: 0 0.5rem 0.5rem 0;
`;

export const ProfileImage = styled.img`
  display: flex;
  min-width: 80px;
  max-width: 80px;

  border-radius: 0.5rem;
`;

export const LionCrestWatermark = styled.img`
  position: absolute;
  right: 0;
  bottom: 0;

  height: 30px;
  width: 45px;
`;

export const FieldsContainer = styled.div`
  margin-left: 1rem;
`;

export const StyledBottomText = styled.div`
  font-family: 'Poppins';
  font-weight: 500;

  font-size: 0.75rem;
  line-height: 1rem;
  color: #141414;
  width: 100%;

  margin-bottom: 1rem;
`;

export const InvalidWatermark = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;
