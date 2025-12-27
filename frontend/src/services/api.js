const BASE_URL = "http://127.0.0.1:8000/api";

export const getSchedule = async (year) => {
    const res = await fetch(`${BASE_URL}/schedule/${year}`);
    return res.json();
};

export const getSessionResults = async (year, round, sessionType) => {
    const res = await fetch(`${BASE_URL}/session/${year}/${round}/${sessionType}`);
    return res.json();
};

export const getTelemetry = async (year, round, sessionType, driver) => {
    const res = await fetch(`${BASE_URL}/telemetry/${year}/${round}/${sessionType}/${driver}`);
    return res.json();
};