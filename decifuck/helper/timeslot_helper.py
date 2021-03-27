def compute_timeslot_hour(code: int):
    return code / 12

def compute_date_params(date):
    return date.format("D/MM/YYYY")

def get_decimal_hour(hour):
    return float(int(hour.split(":")[0]) + float(hour.split(":")[1]) / 60)