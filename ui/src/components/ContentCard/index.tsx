import type { ReactNode } from 'react';
import React from 'react';
import {
  StyledContentCard,
  StyledContentCardBody,
  StyledContentCardTitle,
  StyledContentCardTitleContext,
} from '@/components/ContentCard/styles/index.styled';

interface ContentCardProps {
  id?: string;
  title?: string | ReactNode;
  height?: string;
  children?: string | ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}
const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title = '提示',
  children,
  height,
  style,
  bodyStyle,
}) => {
  return (
    <StyledContentCard style={style}>
      <StyledContentCardBody height={height} style={bodyStyle}>
        <StyledContentCardTitle id={id}>
          <StyledContentCardTitleContext>{title}</StyledContentCardTitleContext>
        </StyledContentCardTitle>
        {children}
      </StyledContentCardBody>
    </StyledContentCard>
  );
};
export default ContentCard;
