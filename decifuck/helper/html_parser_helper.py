from bs4 import BeautifulSoup
from model.timeslot import Timeslot, DaySlots
from helper.timeslot_helper import compute_timeslot_hour


def parse_html_planning(planning_html):
    planning_soup = BeautifulSoup(planning_html, 'html.parser')
    return planning_soup


def parse_slots(terrain_container):
    return [slot.decode_contents()
            for slot in terrain_container.findAll(attrs={"class": "creneau"})
            if slot.decode_contents().split("|")[1] == "cours" or slot.decode_contents().split("|")[1] == "complet"]


def get_timeslots_from_html_planning(planning_html):
    planning_soup = parse_html_planning(planning_html)
    week_slots = []
    day_containers = planning_soup.findAll(attrs={"class": "jour-container"})

    for day_container in day_containers:
        # day container contains a "titre-jour" and a "terrain-container"
        # which contains itself all timeslots for a given room
        day = day_container.find(attrs={"class": "titre-jour"}).decode_contents()
        terrain_containers = day_container.findAll(attrs={"class": "terrain-container"})
        for terrain_container in terrain_containers:
            room = terrain_container.find(attrs={"class": "titre-terrain"}).decode_contents()

            slots = parse_slots(terrain_container)
            # parse slots '0|libre|96|3||f||' to retrieve the hour and type of wod
            # then construct each Timeslot objects and the WeekSlots object
            if slots:
                timeslots = []
                for slot in slots:
                    timeslot_data = slot.split("|")
                    code = timeslot_data[0]
                    full = timeslot_data[1] == "complet"
                    hour = compute_timeslot_hour(int(timeslot_data[2]))
                    type = timeslot_data[4] if timeslot_data[4] else room
                    timeslots.append(Timeslot(code=code, full=full, hour=hour, type=type, day=day))

                week_slots.append(DaySlots(day=day, slots=timeslots))
    return week_slots
