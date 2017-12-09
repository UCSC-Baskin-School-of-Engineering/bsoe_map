import ezdxf
import json
from pathlib import Path

BOUNDS = { 'x': 47.36, 'y': 35.55, 'w': 705.28, 'h': 528.96 }

def map_num(val, fromMin, fromMax, toMin, toMax):
  return (val - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin

def get_room(string):
  try:
    return int(string)
  except ValueError:
    return string.lstrip('0')

OUTPUT_PATH = '../src/floors'

if __name__ == "__main__":

  fi = open('./bounds.json', 'r')
  allBounds = json.load(fi)
  fi.close()

  fi2 = open('./sizes.json', 'r')
  allSizes = json.load(fi2)
  fi2.close()

  for label, bounds in allBounds.items():

    size = allSizes[label]

    dxf = ezdxf.readfile('./cad/floor' + label + '.dxf')
    modelspace = dxf.modelspace()

    result = {}

    for e in modelspace:
      dxftype = e.dxftype()
      if dxftype == 'MTEXT' and e.dxf.layer.upper() == 'A-AREA-IDEN':

        pos = e.dxf.insert
        room = get_room(e.get_text())

        if (room != None):
          # lng = round(pos[0], 2)
          # lat = round(pos[1] , 2)
          lat = map_num(round(pos[1], 2), size['sy'], size['fy'], bounds['y'], bounds['y'] + bounds['h'])
          lng = map_num(round(pos[0] , 2), size['sx'], size['fx'], bounds['x'], bounds['x'] + bounds['w'])
          result[room] = [lat, lng]

    fo = open(OUTPUT_PATH + '/floor' + label + '.json', 'w+')
    json.dump(result, fo, indent=2, separators=(',', ': '))
    fo.close()

