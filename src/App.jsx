import React, { useEffect, useState, Suspense } from "react";

// import AuthenticatedApp from "./AuthenticatedApp";
// import SensorField from "./SensorField";
import UnAuntenticatedApp from "./UnauthenticatedApp";
import { authStore } from "./state/store";
import LoadingSkeleton from "./LoadingSkeleton";
import { apiClient } from "./apiClient";
import Redirecter from "./Redirecter";
import NavBar from "./NavBar";

function App() {
	const [authenticated] = authStore((state) => [state.authenticated]);

	useEffect(() => {
		apiClient.get("/auth/me/secure").then((res) => {
			console.log(res);
		});
	}, []);

	console.log("authenticated => ", authenticated);
	const sensorFieldPromise = import("./pages/field/SensorField");
	const SensorField = React.lazy(() => sensorFieldPromise);

	// REGISTER ERROR OVERLAY - Ved ikke helt hvor dette passer ind henne
	const showErrorOverlay = (err) => {
		// must be within function call because that's when the element is defined for sure.
		const ErrorOverlay = customElements.get("vite-error-overlay");
		// don't open outside vite environment
		if (!ErrorOverlay) {
			return;
		}
		console.log(err);
		const overlay = new ErrorOverlay(err);
		document.body.appendChild(overlay);
	};
	window.addEventListener("error", showErrorOverlay);
	window.addEventListener("unhandledrejection", ({ reason }) =>
		showErrorOverlay(reason)
	);

	// TODO:
	// 1. Added token expiration check

	if (!authenticated) {
		return (
			<>
				<NavBar />
				<UnAuntenticatedApp />
			</>
		);
	}

	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<Redirecter SensorField={SensorField} />
		</Suspense>
	);
}

export default App;
