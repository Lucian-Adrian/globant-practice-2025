export const ALLOW_FUTURE_HIRE_DATE = false;
export const YEARS_15 = 15;
export const YEARS_125 = 125;

// Return local YYYY-MM-DD string for (today - N years)
export const yyyyMmDdYearsAgo = (years, from = new Date()) => {
	const d = new Date(from);
	d.setHours(0, 0, 0, 0);
	d.setFullYear(d.getFullYear() - years);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};
