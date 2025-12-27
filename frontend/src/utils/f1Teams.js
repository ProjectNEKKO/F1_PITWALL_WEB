export const TEAM_COLORS = {
    "Red Bull Racing": "#3671C6", // Blue
    "Ferrari": "#E8002D",         // Red
    "Mercedes": "#27F4D2",        // Teal
    "McLaren": "#FF8000",         // Orange
    "Aston Martin": "#229971",    // Green
    "Alpine": "#0093CC",          // Blue
    "Williams": "#64C4FF",        // Light Blue
    "RB": "#6692FF",              // VCARB Blue
    "Kick Sauber": "#52E252",     // Neon Green
    "Haas F1 Team": "#B6BABD",    // Grey
    "Haas": "#B6BABD",            // Alternate
    "default": "#FF0000"          // Fallback Red
};

export const getTeamColor = (teamName) => {
    return TEAM_COLORS[teamName] || TEAM_COLORS.default;
};