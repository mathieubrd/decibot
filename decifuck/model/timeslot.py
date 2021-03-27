class Timeslot:
    #     18778|complet|132|12|WOD |f|14|14
    code: str
    full: bool
    room: str  # WOD , WOD INTERMEDIAIRE, SPORT(1H30) - SURDEMANDE, GYMNASTIQUE, AEROBIE, Functionnal bodybuilding, OPEN GYM SUR DEMANDE, HALTEROPHILIE
    day: str
    hour: str

    def __init__(self, code, full, hour, room, day):
        # This should return a 8 values array
        self.code = code
        self.full = full
        self.hour = hour
        self.day = day
        self.room = room.lower()


class DaySlots:
    day: str
    slots: list

    def __init__(self, day, slots):
        self.day = day.lower()
        self.slots = slots