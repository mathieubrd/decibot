import requests
from helper.html_parser_helper import parse_html_planning, get_timeslots_from_html_planning
from helper.timeslot_helper import compute_date_params
from model.timeslot import Timeslot, DaySlots

DECIPLUS_URL = 'https://resa-crossfitsaintsimon.deciplus.pro'
DECIPLUS_AUTH_PAGE = "/sp_accueil.php"
DECIPLUS_PLANNING_PAGE = "/sp_lecons_planning.php?sport=all"
DECIPLUS_RESERVATION_PAGE = "/sp_reserver_lecon.php?&idz=1"
DECIPLUS_RESERVATION_ATT = "/sp_reserver_lecon_att.php"

class DeciplusSession:
    def __init__(self, username, password):
        payload = {"sp_mail": username, "sp_pwd": password}
        response = requests.post(DECIPLUS_URL + DECIPLUS_AUTH_PAGE, params=payload)
        self.php_sessid = response.cookies["PHPSESSID"]
        self.cookies = dict(PHPSESSID=self.php_sessid)

    def book_timeslot(self, timeslot: Timeslot):
        booking_url = DECIPLUS_RESERVATION_ATT if timeslot.full else DECIPLUS_RESERVATION_PAGE
        response = requests.post(DECIPLUS_URL+booking_url,
                                 cookies=self.cookies,
                                 data={"idr": timeslot.code,
                                       "idz": 1,
                                       "sport": 1,
                                       "act": "new",
                                       "etat_resa": "init"})
        return response

    def get_timeslots_for_week(self, date):
        # Next week, first day of the week (monday)
        date_params = compute_date_params(date.start_of("week"))
        print(f"Looking for next week timeslots, starting on {date_params}")
        response = requests.get(DECIPLUS_URL + DECIPLUS_PLANNING_PAGE, cookies=self.cookies, params={"date": date_params})
        return get_timeslots_from_html_planning(response.content)