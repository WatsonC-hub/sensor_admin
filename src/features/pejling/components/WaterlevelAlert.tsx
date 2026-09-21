import { Box, Alert, Typography } from "@mui/material";
import React from "react";

import { limitDecimalNumbers } from "~/helpers/dateConverter";

type Props = {
  latestMeasurementSeverity: "warning" | "info";
  hide: boolean;
  MPTitle: string;
  koteTitle: string | number;
  elevationDiff: number | undefined;
  pejlingOutOfRange: boolean;
};

const DisplayWaterlevelAlert = ({
  elevationDiff,
  pejlingOutOfRange,
  latestMeasurementSeverity,
  MPTitle,
  koteTitle,
  hide,
}: Props) => {
  return (
    <Box
      sx={{
        mx: "auto",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
        width: "100%",
      }}
    >
      {elevationDiff !== undefined && (
        <Alert
          severity={latestMeasurementSeverity}
          sx={{
            display: hide ? "none" : "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography>
            Forskel til seneste måling: {limitDecimalNumbers(elevationDiff)} m
          </Typography>
        </Alert>
      )}
      <Alert
        severity={pejlingOutOfRange ? "error" : "info"}
        sx={{
          alignItems: "center",
        }}
      >
        {pejlingOutOfRange ? (
          <Typography
            sx={{
              maxWidth: 200,
            }}
          >
            Der er intet målepunkt registreret på det valgte tidspunkt.
          </Typography>
        ) : (
          <>
            <Typography>Målepunkt: {MPTitle}</Typography>
            <Typography>Kote: {koteTitle} m</Typography>
          </>
        )}
      </Alert>
    </Box>
  );
};

export default DisplayWaterlevelAlert;
