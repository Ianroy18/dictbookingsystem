export const PH_HOLIDAYS_2026: { [key: string]: string } = {
    '01-01': "New Year's Day",
    '04-02': "Maundy Thursday",
    '04-03': "Good Friday",
    '04-09': "Araw ng Kagitingan",
    '05-01': "Labor Day",
    '06-12': "Independence Day",
    '08-21': "Ninoy Aquino Day",
    '08-31': "National Heroes Day",
    '11-01': "All Saints' Day",
    '11-30': "Bonifacio Day",
    '12-25': "Christmas Day",
    '12-30': "Rizal Day"
};

export const getHoliday = (date: Date) => {
    const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return PH_HOLIDAYS_2026[key] || null;
};

export const isSunday = (date: Date) => {
    return date.getDay() === 0;
};
