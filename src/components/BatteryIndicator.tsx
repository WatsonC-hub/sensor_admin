import * as React from 'react';

const Rect = ({index, steps}: {index: number; steps: number}) => {
  const incr = 12 * (steps / 3);
  const placement = incr + incr * steps - index * incr;
  const height = 5;

  return (
    <path
      d={`M46 ${placement}c0 1.1-.9 2-2 2H20c-1.1 0-2-.9-2-2v-${height}c0-1.1.9-2 2-2h24c1.1 0 2 .9 2 2v4`}
    />
  );
};

type BatteryIndicatorProps = React.SVGProps<SVGSVGElement> & {
  percentage: number;
  isPowered?: boolean;
};

const BatteryIndicator = ({percentage, isPowered, ...svgProps}: BatteryIndicatorProps) => {
  const num_rects = Math.ceil(percentage / 33.4);
  let color = 'white';

  if (percentage < 10) {
    color = '#f44336';
  } else if (percentage < 50) {
    color = '#f9a825';
  }

  return (
    <svg
      width="inherit"
      height="inherit"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      role="img"
      className="iconify iconify--emojione"
      preserveAspectRatio="xMidYMid meet"
      {...svgProps}
    >
      <g fill="white">
        <path d="M42 7c0 1.1-.9 2-2 2H24c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v3" />
        <path d="M48 6H16c-2.2 0-4 1.8-4 4v48c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V10c0-2.2-1.8-4-4-4m0 47c0 .5-.5 1-1 1H17c-.5 0-1-.5-1-1V15c0-.5.5-1 1-1h30c.5 0 1 .5 1 1v38" />
      </g>
      <g fill={color}>
        {isPowered ? (
          <path
            d="M30 20 L36 20 L32 32 L38 32 L28 46 L30 34 L24 34 Z"
            fill="white"
            stroke="white"
            strokeWidth="1"
          />
        ) : (
          Array.from({length: num_rects}, (_, i) => <Rect key={i} index={i} steps={3} />)
        )}

        {num_rects === 0 && !isPowered && (
          <path
            d="M 14.365 44.401 C 14.365 41.182 18.385 39.171 21.595 40.78 C 23.09 41.529 24.006 42.908 24.006 44.401 C 24.006 47.62 19.99 49.63 16.775 48.021 C 15.286 47.277 14.365 45.893 14.365 44.401 Z M 14.837 19.297 C 14.485 16.4 17.879 14.26 20.949 15.443 C 22.675 16.111 23.712 17.667 23.514 19.297 L 21.827 33.958 C 21.615 35.73 19.272 36.633 17.609 35.588 C 16.997 35.204 16.602 34.61 16.524 33.958 L 14.837 19.297 Z"
            transform="matrix(1,0, 0, 1, 12, 3)"
          />
        )}
      </g>
    </svg>
  );
};
export default BatteryIndicator;
