import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import WantedSlot from '../models/wantedSlot'

const tableName = 'decifuck-wanted-slots'

export const getWantedSlots = async (email: string): Promise<WantedSlot[]> => {
  const client = new DynamoDBClient({})
  const documentClient = DynamoDBDocumentClient.from(client)
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      email
    }
  })
  const response = await documentClient.send(command)

  if (!response.Item || !response.Item.wanted_slots) {
    return []
  }

  return response.Item.wanted_slots.map((wantedSlot: {[key: string]: string}): WantedSlot => {
    return {
      day: wantedSlot.day,
      activity: wantedSlot.activity,
      hour: wantedSlot.hour,
      room: wantedSlot.room
    }
  })
}
