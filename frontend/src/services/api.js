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

// --- MAKE SURE THIS PART IS HERE ---
export const getTrackMap = async (year, round, sessionType, driver) => {
    const res = await fetch(`${BASE_URL}/map/${year}/${round}/${sessionType}/${driver}`);
    return res.json();
};

export const getTyreStrategy = async (year, round, sessionType, driver) => {
    const res = await fetch(`${BASE_URL}/strategy/${year}/${round}/${sessionType}/${driver}`);
    return res.json();
};

export const getTimeDelta = async (year, round, sessionType, driver1, driver2) => {
    const res = await fetch(`${BASE_URL}/delta/${year}/${round}/${sessionType}/${driver1}/${driver2}`);
    return res.json();
};

export const getDriverStandings = async (year = 'current') => {
    try {
        // 👇 UPDATE THIS URL
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`);
        
        const data = await response.json();
        if (!data.MRData || !data.MRData.StandingsTable.StandingsLists.length) return [];
        return data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
    } catch (error) {
        console.error("Error fetching driver standings:", error);
        return [];
    }
};

export const getConstructorStandings = async (year = 'current') => {
    try {
        // 👇 UPDATE THIS URL
        const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`);
        
        const data = await response.json();
        if (!data.MRData || !data.MRData.StandingsTable.StandingsLists.length) return [];
        return data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
    } catch (error) {
        console.error("Error fetching constructor standings:", error);
        return [];
    }
};