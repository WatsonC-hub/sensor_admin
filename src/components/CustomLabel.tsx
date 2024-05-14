import React from 'react';
import { Typography, SvgIcon, TypographyProps, SvgIconProps } from '@mui/material';

interface CustomLabelProps {
    value: string;
    text: string;
    icon: React.ReactElement<SvgIconProps>;
    color?: string;
    typographyProps?: TypographyProps;
}

const CustomBottomNavigationActionLabel: React.FC<CustomLabelProps> = ({
    text,
    value,
    icon,
    color = 'inherit',
    typographyProps,
}) => {
    return (
        <div style={{ display: 'inline-block', alignItems: 'center' }}>
        <SvgIcon component="span" sx={{ fontSize: '1.2rem', marginRight: '4px', color: color }}>
            {icon}
        </SvgIcon>
        <Typography variant="body2" color={color} {...typographyProps}>
            {text}
        </Typography>
        </div>
    );
};

export default CustomBottomNavigationActionLabel;