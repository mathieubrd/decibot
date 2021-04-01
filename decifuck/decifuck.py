import boto3
import base64
import json
import pendulum
from botocore.exceptions import ClientError
from deciplus_session import DeciplusSession
from helper.timeslot_helper import get_decimal_hour

def get_deciplus_credentials(secret_name, username):
    secrets_manager = boto3.client("secretsmanager")
    response = secrets_manager.get_secret_value(
        SecretId=secret_name
    )

    secrets = json.loads(response["SecretString"])
    usernames = secrets["usernames"].split(",")
    passwords = secrets["passwords"].split(",")
    credentials = [{ "username": username, "password": passwords[i] } for i, username in enumerate(usernames)]

    return list(filter(lambda cred: cred["username"] == username, credentials))[0]

def process_week_slots(session, week_slots, wanted_slots):
    for wanted_slot in wanted_slots:
        for day_slots in week_slots:
            process_day_slots(session, wanted_slot, day_slots)

def process_day_slots(session, wanted_slot, day_slots):
    wanted_day = wanted_slot["day"].lower()
    wanted_hour = get_decimal_hour(wanted_slot["hour"])
    wanted_room = wanted_slot["room"].lower() if "room" in wanted_slot else None

    if day_slots.day == wanted_day:
        for slot in day_slots.slots:
            if wanted_room:
                if slot.hour == wanted_hour and wanted_room == slot.room:
                    session.book_timeslot(timeslot=slot)
            else:
                if slot.hour == wanted_hour:
                    session.book_timeslot(timeslot=slot)

def handler(event, context):
    ssm_client = boto3.client("ssm")

    wanted_slots_parameter_store_name = event["wanted_slots_parameter_name"]
    secret_name = event["secret_name"]
    parameters = json.loads(ssm_client.get_parameter(Name=wanted_slots_parameter_store_name)["Parameter"]["Value"])

    for parameter in parameters:
        username = parameter["username"]
        wanted_slots = parameter["wanted_slots"]
        credentials = get_deciplus_credentials(secret_name, username)
        session = DeciplusSession(username=username, password=credentials["password"])
        week = pendulum.now()

        for _ in range(2):
            week_slots = session.get_timeslots_for_week(week)
            process_week_slots(session, week_slots, wanted_slots)
            week = week.add(weeks=1)
