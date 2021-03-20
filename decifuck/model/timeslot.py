from dataclasses import dataclass
from helper.timeslot_helper import compute_timeslot_hour


# timeslot_days = {
# "7h": 84, "8h": 96, "11h": 132, "12h": 147,
# "13h15": 159, "14h": 168, "14h15": 171, "16h": 192, "17h": 204,
# "18h": 216, "19h": 228, "20h": 240}

@dataclass
class Timeslot:
    #     18778|complet|132|12|WOD |f|14|14
    code: str
    full: bool
    type: str  # WOD , WOD INTERMEDIAIRE, SPORT(1H30) - SURDEMANDE, GYMNASTIQUE, AEROBIE, Functionnal bodybuilding, OPEN GYM SUR DEMANDE, HALTEROPHILIE
    day: str
    hour: str
    # room: int  # SALLE 1 , SALLE 2 , SALLE HALTERO, _ESPACE BIEN ETRE

    def __init__(self, code, full, hour, type, day):
        # This should return a 8 values array
        self.code = code
        self.full = full
        self.hour = hour
        self.day = day
        self.type = type


@dataclass
class DaySlots:
    day: str
    slots: list[Timeslot]