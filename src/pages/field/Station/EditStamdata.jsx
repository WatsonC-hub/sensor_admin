import React, { useEffect, useState } from "react";
import {
	Container,
	Grid,
	Typography,
	Button,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	AppBar,
	Tab,
	Tabs,
	CardContent,
	Card,
} from "@mui/material";
import "date-fns";
import OwnDatePicker from "../../../components/OwnDatePicker";

import LocationForm from "../Stamdata/components/LocationForm";
import StationForm from "../Stamdata/components/StationForm";
import UdstyrForm from "../Stamdata/components/UdstyrForm";
import { updateStamdata, apiClient } from "src/pages/field/fieldAPI";
import AddUdstyrForm from "../Stamdata/AddUdstyrForm";
import SaveIcon from "@mui/icons-material/Save";
import moment from "moment";
import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { stamdataStore } from "../../../state/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useBreakpoints from "src/hooks/useBreakpoints";

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`full-width-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box p={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired,
};

function a11yProps(index) {
	return {
		id: `full-width-tab-${index}`,
		"aria-controls": `full-width-tabpanel-${index}`,
	};
}

const UnitEndDateDialog = ({
	openDialog,
	setOpenDialog,
	unit,
	setUdstyrValue,
	stationId,
}) => {
	const [date, setdate] = useState(new Date());

	const queryClient = useQueryClient();

	const handleDateChange = (date) => {
		setdate(date);
	};

	const takeHomeMutation = useMutation(
		async () => {
			const { data } = await apiClient.patch(
				`/sensor_field/stamdata/unit_history/${stationId}/${unit.gid}`,
				{
					enddate: moment(date).format("YYYY-MM-DD HH:mm"),
				}
			);
			return data;
		},
		{
			onSuccess: (data) => {
				setOpenDialog(false);
				setUdstyrValue("slutdato", moment(date).format("YYYY-MM-DD HH:mm"));
				toast.success("Udstyret er hjemtaget");
				queryClient.invalidateQueries(["udstyr", stationId]);
			},
		}
	);

	return (
		<Dialog open={openDialog}>
			<DialogTitle>Angiv slutdato</DialogTitle>
			<DialogContent>
				<OwnDatePicker
					label="Fra"
					value={date}
					onChange={(date) => handleDateChange(date)}
				/>
				<DialogActions item xs={4} sm={2}>
					<Button
						autoFocus
						color="secondary"
						variant="contained"
						startIcon={<SaveIcon />}
						onClick={takeHomeMutation.mutate}
					>
						Gem
					</Button>
					<Button
						color="secondary"
						variant="contained"
						onClick={() => {
							setOpenDialog(false);
						}}
					>
						Annuller
					</Button>
				</DialogActions>
			</DialogContent>
		</Dialog>
	);
};

const UdstyrReplace = ({ stationId, selected, setselected }) => {
	const [openDialog, setOpenDialog] = useState(false);
	const [openAddUdstyr, setOpenAddUdstyr] = useState(false);

	const [tstype_id, setUnitValue, setUnit] = stamdataStore((store) => [
		store.timeseries.tstype_id,
		store.setUnitValue,
		store.setUnit,
	]);

	const { data } = useQuery(
		["udstyr", stationId],
		async () => {
			const { data } = await apiClient.get(
				`/sensor_field/stamdata/unit_history/${stationId}`
			);
			return data;
		},
		{
			onSuccess: (data) => {
				setselected(data[0].gid);
			},
		}
	);

	const handleChange = (event) => {
		setUnit(data.filter((elem) => elem.gid === event.target.value)[0]);
		setselected(event.target.value);
	};

	const flex1 = {
		display: "flex",
		alignItems: "baseline",
		justifyContent: "space-between",
	};

	return (
		<Grid container spacing={2} alignItems="center" alignContent="center">
			<Grid item xs={12} sm={6}>
				<Select value={selected} onChange={handleChange}>
					{data?.map((item) => {
						let endDate =
							moment(new Date()) < moment(item.slutdato)
								? "nu"
								: moment(item.slutdato).format("YYYY-MM-DD HH:mm");

						return (
							<MenuItem key={item.gid} value={item.gid}>
								{`${moment(item.startdato).format(
									"YYYY-MM-DD HH:mm"
								)} - ${endDate}`}
							</MenuItem>
						);
					})}
				</Select>
			</Grid>
			<Grid item xs={12} sm={6}>
				{moment(data?.[0].slutdato) > moment(new Date()) ? (
					<Button
						color="secondary"
						variant="contained"
						onClick={() => {
							setOpenDialog(true);
						}}
					>
						Hjemtag udstyr
					</Button>
				) : (
					<Button
						color="secondary"
						variant="contained"
						onClick={() => {
							setOpenAddUdstyr(true);
						}}
					>
						Tilføj udstyr
					</Button>
				)}
			</Grid>
			<UnitEndDateDialog
				openDialog={openDialog}
				setOpenDialog={setOpenDialog}
				unit={data?.[0]}
				setUdstyrValue={setUnitValue}
				stationId={stationId}
			/>
			<AddUdstyrForm
				udstyrDialogOpen={openAddUdstyr}
				setUdstyrDialogOpen={setOpenAddUdstyr}
				tstype_id={tstype_id}
			/>
		</Grid>
	);
};

export default function EditStamdata({ setFormToShow, stationId }) {
	const [selectedUnit, setSelectedUnit] = useState(-1);

	const [location, timeseries, unit] = stamdataStore((store) => [
		store.location,
		store.timeseries,
		store.unit,
	]);

	const { isTouch } = useBreakpoints();

	const queryClient = useQueryClient();
	const [value, setValue] = React.useState(0);
	const [swiper, setSwiper] = useState(null);

	const handleSubmit = () => {
		console.log(selectedUnit);
		updateStamdata({
			location,
			station: timeseries,
			udstyr: { ...unit, gid: selectedUnit },
		})
			.then((res) => {
				console.log(res);
				toast.success("Stamdata er opdateret");
				queryClient.invalidateQueries(["udstyr", stationId]);
			})
			.catch((error) => {
				toast.error("Der skete en fejl");
			});
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
		if (swiper && event) {
			swiper.allowSlidePrev = true;
			swiper.allowSlideNext = true;
			swiper.slideTo(newValue);
		}
	};

	useEffect(() => {
		if (swiper) {
			// swiper.slideTo(0, 0, false);
			swiper.activeIndex = 0;
		}
	}, [swiper]);

	if (swiper) {
		swiper.allowSlidePrev = isTouch;
		swiper.allowSlideNext = isTouch;
	}

	return (
		<Card
			style={{ marginBottom: 25 }}
			sx={{
				width: { xs: "100%", sm: "70%" },
				marginLeft: { xs: "0%", sm: "15%" },
				textAlign: "center",
				justifyContent: "center",
				alignContent: "center",
			}}
		>
			<CardContent>
				<Container fixed>
					<Typography
						variant="h6"
						component="h3"
						style={{ marginBottom: "5px" }}
					>
						Stamdata
					</Typography>
					<AppBar
						position="static"
						color="default"
						style={{ marginBottom: "5px" }}
					>
						<Tabs
							value={value}
							onChange={handleChange}
							indicatorColor="primary"
							textColor="primary"
							variant="fullWidth"
							aria-label="full width tabs example"
						>
							<Tab label="Udstyr" {...a11yProps(0)} />
							<Tab label="Lokalitet" {...a11yProps(1)} />
							<Tab label="Station" {...a11yProps(2)} />
						</Tabs>
					</AppBar>

					<Swiper
						initialSlide={2}
						onSwiper={(swiper) => {
							setSwiper((prev) => {
								setValue(0);
								swiper.slideTo(0, 0, false);
								return swiper;
							});
						}}
						onSlideChange={(swiper) => handleChange(null, swiper.activeIndex)}
					>
						<SwiperSlide>
							<Box>
								<UdstyrReplace
									stationId={stationId}
									selected={selectedUnit}
									setselected={setSelectedUnit}
								/>
								<UdstyrForm mode={"edit"} />
							</Box>
						</SwiperSlide>
						<SwiperSlide>
							<LocationForm />
						</SwiperSlide>
						<SwiperSlide>
							<StationForm />
						</SwiperSlide>
					</Swiper>

					<Grid container alignItems="center" justifyContent="center">
						<Grid xs={4} sm={2}>
							<Button
								autoFocus
								color="secondary"
								variant="contained"
								startIcon={<SaveIcon />}
								onClick={handleSubmit}
							>
								Gem
							</Button>
						</Grid>
						<Grid xs={4} sm={2}>
							<Button
								color="grey"
								variant="contained"
								onClick={() => {
									setFormToShow(null);
								}}
							>
								Annuller
							</Button>
						</Grid>
					</Grid>
				</Container>
			</CardContent>
		</Card>
	);
}
