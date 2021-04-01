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

def handler(event, context):
    secret_name = event["secret_name"]
    username = event["username"]
    wanted_slots = event["wanted_slots"]
    credentials = get_deciplus_credentials(secret_name, username)

    session = DeciplusSession(credentials["username"], credentials["password"])

    week = pendulum.now()
    for _ in range(2):
        day_slots = session.get_timeslots_for_week(week)

        for wanted_slot in wanted_slots:
            wanted_day = wanted_slot["day"].lower()
            wanted_hour = get_decimal_hour(wanted_slot["hour"])
            wanted_room = wanted_slot["room"].lower()

            for day_slot in day_slots:
                if day_slot.day == wanted_day:
                    for slot in day_slot.slots:
                        if slot.hour == wanted_hour:
                            session.book_timeslot(timeslot=slot)
                            return slot.hour
        
        week = week.add(weeks=1)
