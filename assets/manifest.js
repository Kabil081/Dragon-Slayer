// Same data as manifest.json, loadable from file:// pages.
window.ASSET_MANIFEST = {
 "weapons": {
  "steel_sword": {
   "name": "Steel Sword",
   "size": [
    110,
    361
   ],
   "grip": [
    55.0,
    294.0
   ],
   "tip": [
    55.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/steel_sword.png"
  },
  "northern_longsword": {
   "name": "Northern Longsword",
   "size": [
    132,
    459
   ],
   "grip": [
    66.0,
    358.0
   ],
   "tip": [
    66.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/northern_longsword.png"
  },
  "greatsword": {
   "name": "Greatsword",
   "size": [
    168,
    588
   ],
   "grip": [
    84.0,
    462.0
   ],
   "tip": [
    84.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/greatsword.png"
  },
  "frostblade": {
   "name": "Frostblade",
   "size": [
    160,
    424
   ],
   "grip": [
    80.0,
    350.0
   ],
   "tip": [
    80.0,
    22.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/frostblade.png"
  },
  "lightbreaker": {
   "name": "Lightbreaker",
   "size": [
    148,
    464
   ],
   "grip": [
    74.0,
    374.0
   ],
   "tip": [
    74.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/lightbreaker.png"
  },
  "dragonbane": {
   "name": "Dragonbane",
   "size": [
    144,
    467
   ],
   "grip": [
    72.0,
    386.0
   ],
   "tip": [
    72.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/dragonbane.png"
  },
  "war_hammer": {
   "name": "War Hammer",
   "size": [
    200,
    571
   ],
   "grip": [
    98.0,
    413.0
   ],
   "tip": [
    98.0,
    5.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/war_hammer.png"
  },
  "twin_daggers": {
   "name": "Twin Daggers",
   "size": [
    78,
    231
   ],
   "grip": [
    39.0,
    182.0
   ],
   "tip": [
    39.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/twin_daggers.png"
  },
  "long_spear": {
   "name": "Long Spear",
   "size": [
    66,
    708
   ],
   "grip": [
    33.0,
    486.0
   ],
   "tip": [
    33.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/long_spear.png"
  },
  "hunters_crossbow": {
   "name": "Hunter's Crossbow",
   "size": [
    244,
    347
   ],
   "grip": [
    122.0,
    245.0
   ],
   "tip": [
    122.0,
    5.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/hunters_crossbow.png"
  },
  "frostbound_axe": {
   "name": "Frostbound Axe",
   "size": [
    160,
    398
   ],
   "grip": [
    54.0,
    328.0
   ],
   "tip": [
    54.0,
    24.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/frostbound_axe.png"
  },
  "gatechain_flail": {
   "name": "Gatechain Flail",
   "size": [
    126,
    548
   ],
   "grip": [
    61.0,
    462.0
   ],
   "tip": [
    61.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/gatechain_flail.png"
  },
  "aemond_blade": {
   "name": "Valyrian Blade",
   "size": [
    120,
    431
   ],
   "grip": [
    60.0,
    350.0
   ],
   "tip": [
    60.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/aemond_blade.png"
  },
  "frostbrand": {
   "name": "Frostbrand",
   "size": [
    184,
    508
   ],
   "grip": [
    92.0,
    408.0
   ],
   "tip": [
    92.0,
    24.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/frostbrand.png"
  },
  "blackfyre": {
   "name": "Blackfyre",
   "size": [
    152,
    493
   ],
   "grip": [
    76.0,
    406.0
   ],
   "tip": [
    76.0,
    6.0
   ],
   "orientation": "blade points up; grip is where the hand closes",
   "file": "weapons/blackfyre.png"
  }
 },
 "game": "DRAGONSLAYER: Rise of the North",
 "generator": "tools/generate_assets.py",
 "generated": "2026-10-17",
 "warrior": {
  "base": "sprites/warrior/warrior_base.png",
  "base_size": [
   512,
   414
  ],
  "frame_size": [
   336,
   272
  ],
  "facing": "right",
  "pivot": [
   152,
   252
  ],
  "pivot_note": "feet on the ground line; place pivot at the floor y",
  "recommended_scale_1080p": 1.9,
  "variants": [
   "steel_sword",
   "northern_longsword",
   "greatsword",
   "frostblade",
   "lightbreaker",
   "dragonbane",
   "war_hammer",
   "twin_daggers",
   "long_spear",
   "hunters_crossbow",
   "frostbound_axe",
   "gatechain_flail",
   "unarmed",
   "frostbrand"
  ],
  "sheet_pattern": "sprites/warrior/sheets/{variant}/warrior_{anim}.png",
  "frames_pattern": "sprites/warrior/frames/{anim}/warrior_{anim}_{index:02d}.png",
  "frames_note": "individual frames are exported for the steel_sword variant",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 8,
    "loop": true,
    "per_frame": [
     {
      "tips": {
       "steel_sword": [
        210.0,
        95.6
       ],
       "northern_longsword": [
        218.0,
        81.8
       ],
       "greatsword": [
        231.0,
        59.3
       ],
       "frostblade": [
        215.0,
        87.0
       ],
       "lightbreaker": [
        220.0,
        78.3
       ],
       "dragonbane": [
        221.5,
        75.7
       ],
       "war_hammer": [
        225.0,
        69.7
       ],
       "twin_daggers": [
        196.0,
        119.9
       ],
       "long_spear": [
        234.0,
        54.1
       ],
       "hunters_crossbow": [
        204.0,
        106.0
       ],
       "frostbound_axe": [
        212.0,
        92.2
       ],
       "gatechain_flail": [
        231.0,
        59.3
       ],
       "frostbrand": [
        222.0,
        74.9
       ]
      },
      "hand": [
       174.0,
       158.0
      ],
      "weapon_angle": 150.0,
      "bbox": [
       116,
       88,
       213,
       256
      ],
      "tips2": {
       "twin_daggers": [
        187.0,
        123.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        165.0,
        162.0
       ]
      },
      "shoulder": [
       150.0,
       126.0
      ]
     },
     {
      "tips": {
       "steel_sword": [
        208.1,
        96.0
       ],
       "northern_longsword": [
        215.7,
        81.9
       ],
       "greatsword": [
        228.0,
        59.0
       ],
       "frostblade": [
        212.8,
        87.2
       ],
       "lightbreaker": [
        217.6,
        78.4
       ],
       "dragonbane": [
        219.0,
        75.7
       ],
       "war_hammer": [
        222.3,
        69.5
       ],
       "twin_daggers": [
        194.8,
        120.6
       ],
       "long_spear": [
        230.8,
        53.7
       ],
       "hunters_crossbow": [
        202.4,
        106.5
       ],
       "frostbound_axe": [
        210.0,
        92.4
       ],
       "gatechain_flail": [
        228.0,
        59.0
       ],
       "frostbrand": [
        219.5,
        74.8
       ]
      },
      "hand": [
       174.0,
       159.4
      ],
      "weapon_angle": 151.7,
      "bbox": [
       113,
       89,
       212,
       256
      ],
      "tips2": {
       "twin_daggers": [
        185.8,
        124.6
       ]
      },
      "hands2": {
       "twin_daggers": [
        165.0,
        163.4
       ]
      },
      "shoulder": [
       150.4,
       127.1
      ]
     },
     {
      "tips": {
       "steel_sword": [
        208.1,
        96.0
       ],
       "northern_longsword": [
        215.7,
        81.9
       ],
       "greatsword": [
        228.0,
        59.0
       ],
       "frostblade": [
        212.8,
        87.2
       ],
       "lightbreaker": [
        217.6,
        78.4
       ],
       "dragonbane": [
        219.0,
        75.7
       ],
       "war_hammer": [
        222.3,
        69.5
       ],
       "twin_daggers": [
        194.8,
        120.6
       ],
       "long_spear": [
        230.8,
        53.7
       ],
       "hunters_crossbow": [
        202.4,
        106.5
       ],
       "frostbound_axe": [
        210.0,
        92.4
       ],
       "gatechain_flail": [
        228.0,
        59.0
       ],
       "frostbrand": [
        219.5,
        74.8
       ]
      },
      "hand": [
       174.0,
       159.4
      ],
      "weapon_angle": 151.7,
      "bbox": [
       110,
       89,
       212,
       256
      ],
      "tips2": {
       "twin_daggers": [
        185.8,
        124.6
       ]
      },
      "hands2": {
       "twin_daggers": [
        165.0,
        163.4
       ]
      },
      "shoulder": [
       150.4,
       127.1
      ]
     },
     {
      "tips": {
       "steel_sword": [
        210.0,
        95.6
       ],
       "northern_longsword": [
        218.0,
        81.8
       ],
       "greatsword": [
        231.0,
        59.3
       ],
       "frostblade": [
        215.0,
        87.0
       ],
       "lightbreaker": [
        220.0,
        78.3
       ],
       "dragonbane": [
        221.5,
        75.7
       ],
       "war_hammer": [
        225.0,
        69.7
       ],
       "twin_daggers": [
        196.0,
        119.9
       ],
       "long_spear": [
        234.0,
        54.1
       ],
       "hunters_crossbow": [
        204.0,
        106.0
       ],
       "frostbound_axe": [
        212.0,
        92.2
       ],
       "gatechain_flail": [
        231.0,
        59.3
       ],
       "frostbrand": [
        222.0,
        74.9
       ]
      },
      "hand": [
       174.0,
       158.0
      ],
      "weapon_angle": 150.0,
      "bbox": [
       109,
       88,
       213,
       256
      ],
      "tips2": {
       "twin_daggers": [
        187.0,
        123.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        165.0,
        162.0
       ]
      },
      "shoulder": [
       150.0,
       126.0
      ]
     },
     {
      "tips": {
       "steel_sword": [
        211.9,
        95.4
       ],
       "northern_longsword": [
        220.3,
        81.8
       ],
       "greatsword": [
        234.0,
        59.7
       ],
       "frostblade": [
        217.1,
        86.9
       ],
       "lightbreaker": [
        222.4,
        78.4
       ],
       "dragonbane": [
        224.0,
        75.8
       ],
       "war_hammer": [
        227.6,
        69.9
       ],
       "twin_daggers": [
        197.1,
        119.2
       ],
       "long_spear": [
        237.1,
        54.6
       ],
       "hunters_crossbow": [
        205.6,
        105.6
       ],
       "frostbound_axe": [
        214.0,
        92.0
       ],
       "gatechain_flail": [
        234.0,
        59.7
       ],
       "frostbrand": [
        224.5,
        75.0
       ]
      },
      "hand": [
       174.0,
       156.6
      ],
      "weapon_angle": 148.3,
      "bbox": [
       112,
       86,
       215,
       255
      ],
      "tips2": {
       "twin_daggers": [
        188.1,
        123.2
       ]
      },
      "hands2": {
       "twin_daggers": [
        165.0,
        160.6
       ]
      },
      "shoulder": [
       149.6,
       125.0
      ]
     },
     {
      "tips": {
       "steel_sword": [
        211.9,
        95.4
       ],
       "northern_longsword": [
        220.3,
        81.8
       ],
       "greatsword": [
        234.0,
        59.7
       ],
       "frostblade": [
        217.1,
        86.9
       ],
       "lightbreaker": [
        222.4,
        78.4
       ],
       "dragonbane": [
        224.0,
        75.8
       ],
       "war_hammer": [
        227.6,
        69.9
       ],
       "twin_daggers": [
        197.1,
        119.2
       ],
       "long_spear": [
        237.1,
        54.6
       ],
       "hunters_crossbow": [
        205.6,
        105.6
       ],
       "frostbound_axe": [
        214.0,
        92.0
       ],
       "gatechain_flail": [
        234.0,
        59.7
       ],
       "frostbrand": [
        224.5,
        75.0
       ]
      },
      "hand": [
       174.0,
       156.6
      ],
      "weapon_angle": 148.3,
      "bbox": [
       116,
       86,
       215,
       255
      ],
      "tips2": {
       "twin_daggers": [
        188.1,
        123.2
       ]
      },
      "hands2": {
       "twin_daggers": [
        165.0,
        160.6
       ]
      },
      "shoulder": [
       149.6,
       125.0
      ]
     }
    ],
    "variants": [
     "steel_sword",
     "northern_longsword",
     "greatsword",
     "frostblade",
     "lightbreaker",
     "dragonbane",
     "war_hammer",
     "twin_daggers",
     "long_spear",
     "hunters_crossbow",
     "frostbound_axe",
     "gatechain_flail",
     "unarmed",
     "frostbrand"
    ]
   },
   "run": {
    "frames": 8,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "tips": {
       "steel_sword": [
        88.3,
        119.7
       ],
       "northern_longsword": [
        75.7,
        109.8
       ],
       "greatsword": [
        55.2,
        93.8
       ],
       "frostblade": [
        80.4,
        113.5
       ],
       "lightbreaker": [
        72.5,
        107.4
       ],
       "dragonbane": [
        70.1,
        105.5
       ],
       "war_hammer": [
        64.6,
        101.2
       ],
       "twin_daggers": [
        110.3,
        136.9
       ],
       "long_spear": [
        50.4,
        90.1
       ],
       "hunters_crossbow": [
        97.7,
        127.1
       ],
       "frostbound_axe": [
        85.1,
        117.2
       ],
       "gatechain_flail": [
        55.2,
        93.8
       ],
       "frostbrand": [
        69.4,
        104.9
       ]
      },
      "hand": [
       145.0,
       164.0
      ],
      "weapon_angle": 232.0,
      "bbox": [
       85,
       90,
       192,
       255
      ],
      "tips2": {
       "twin_daggers": [
        130.3,
        136.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        165.0,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       127.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        94.4,
        118.0
       ],
       "northern_longsword": [
        82.3,
        107.5
       ],
       "greatsword": [
        62.7,
        90.5
       ],
       "frostblade": [
        86.9,
        111.5
       ],
       "lightbreaker": [
        79.3,
        104.9
       ],
       "dragonbane": [
        77.0,
        102.9
       ],
       "war_hammer": [
        71.7,
        98.3
       ],
       "twin_daggers": [
        115.6,
        136.3
       ],
       "long_spear": [
        58.1,
        86.6
       ],
       "hunters_crossbow": [
        103.5,
        125.9
       ],
       "frostbound_axe": [
        91.4,
        115.4
       ],
       "gatechain_flail": [
        62.7,
        90.5
       ],
       "frostbrand": [
        76.3,
        102.3
       ]
      },
      "hand": [
       148.8,
       165.2
      ],
      "weapon_angle": 229.1,
      "bbox": [
       87,
       87,
       186,
       254
      ],
      "tips2": {
       "twin_daggers": [
        127.9,
        135.2
       ]
      },
      "hands2": {
       "twin_daggers": [
        161.2,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       124.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        109.8,
        114.5
       ],
       "northern_longsword": [
        99.1,
        102.6
       ],
       "greatsword": [
        81.7,
        83.3
       ],
       "frostblade": [
        103.1,
        107.1
       ],
       "lightbreaker": [
        96.4,
        99.6
       ],
       "dragonbane": [
        94.4,
        97.4
       ],
       "war_hammer": [
        89.7,
        92.2
       ],
       "twin_daggers": [
        128.6,
        135.3
       ],
       "long_spear": [
        77.7,
        78.8
       ],
       "hunters_crossbow": [
        117.9,
        123.4
       ],
       "frostbound_axe": [
        107.1,
        111.5
       ],
       "gatechain_flail": [
        81.7,
        83.3
       ],
       "frostbrand": [
        93.8,
        96.7
       ]
      },
      "hand": [
       158.0,
       168.0
      ],
      "weapon_angle": 222.0,
      "bbox": [
       84,
       84,
       190,
       252
      ],
      "tips2": {
       "twin_daggers": [
        122.6,
        131.3
       ]
      },
      "hands2": {
       "twin_daggers": [
        152.0,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       121.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        126.0,
        106.1
       ],
       "northern_longsword": [
        116.8,
        93.0
       ],
       "greatsword": [
        101.9,
        71.7
       ],
       "frostblade": [
        120.2,
        97.9
       ],
       "lightbreaker": [
        114.5,
        89.7
       ],
       "dragonbane": [
        112.8,
        87.3
       ],
       "war_hammer": [
        108.8,
        81.5
       ],
       "twin_daggers": [
        142.0,
        129.1
       ],
       "long_spear": [
        98.5,
        66.8
       ],
       "hunters_crossbow": [
        132.8,
        116.0
       ],
       "frostbound_axe": [
        123.7,
        102.9
       ],
       "gatechain_flail": [
        101.9,
        71.7
       ],
       "frostbrand": [
        112.2,
        86.5
       ]
      },
      "hand": [
       167.2,
       165.2
      ],
      "weapon_angle": 214.9,
      "bbox": [
       88,
       87,
       192,
       254
      ],
      "tips2": {
       "twin_daggers": [
        117.6,
        127.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        142.8,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       124.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        132.8,
        102.9
       ],
       "northern_longsword": [
        124.4,
        89.4
       ],
       "greatsword": [
        110.6,
        67.3
       ],
       "frostblade": [
        127.5,
        94.5
       ],
       "lightbreaker": [
        122.2,
        86.0
       ],
       "dragonbane": [
        120.7,
        83.4
       ],
       "war_hammer": [
        116.9,
        77.5
       ],
       "twin_daggers": [
        147.7,
        126.7
       ],
       "long_spear": [
        107.4,
        62.2
       ],
       "hunters_crossbow": [
        139.2,
        113.1
       ],
       "frostbound_axe": [
        130.7,
        99.5
       ],
       "gatechain_flail": [
        110.6,
        67.3
       ],
       "frostbrand": [
        120.1,
        82.6
       ]
      },
      "hand": [
       171.0,
       164.0
      ],
      "weapon_angle": 212.0,
      "bbox": [
       91,
       90,
       191,
       255
      ],
      "tips2": {
       "twin_daggers": [
        115.7,
        126.7
       ]
      },
      "hands2": {
       "twin_daggers": [
        139.0,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       127.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        126.0,
        106.1
       ],
       "northern_longsword": [
        116.8,
        93.0
       ],
       "greatsword": [
        101.9,
        71.7
       ],
       "frostblade": [
        120.2,
        97.9
       ],
       "lightbreaker": [
        114.5,
        89.7
       ],
       "dragonbane": [
        112.8,
        87.3
       ],
       "war_hammer": [
        108.8,
        81.5
       ],
       "twin_daggers": [
        142.0,
        129.1
       ],
       "long_spear": [
        98.5,
        66.8
       ],
       "hunters_crossbow": [
        132.8,
        116.0
       ],
       "frostbound_axe": [
        123.7,
        102.9
       ],
       "gatechain_flail": [
        101.9,
        71.7
       ],
       "frostbrand": [
        112.2,
        86.5
       ]
      },
      "hand": [
       167.2,
       165.2
      ],
      "weapon_angle": 214.9,
      "bbox": [
       87,
       87,
       186,
       253
      ],
      "tips2": {
       "twin_daggers": [
        117.6,
        127.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        142.8,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       124.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        109.8,
        114.5
       ],
       "northern_longsword": [
        99.1,
        102.6
       ],
       "greatsword": [
        81.7,
        83.3
       ],
       "frostblade": [
        103.1,
        107.1
       ],
       "lightbreaker": [
        96.4,
        99.6
       ],
       "dragonbane": [
        94.4,
        97.4
       ],
       "war_hammer": [
        89.7,
        92.2
       ],
       "twin_daggers": [
        128.6,
        135.3
       ],
       "long_spear": [
        77.7,
        78.8
       ],
       "hunters_crossbow": [
        117.9,
        123.4
       ],
       "frostbound_axe": [
        107.1,
        111.5
       ],
       "gatechain_flail": [
        81.7,
        83.3
       ],
       "frostbrand": [
        93.8,
        96.7
       ]
      },
      "hand": [
       158.0,
       168.0
      ],
      "weapon_angle": 222.0,
      "bbox": [
       84,
       84,
       192,
       251
      ],
      "tips2": {
       "twin_daggers": [
        122.6,
        131.3
       ]
      },
      "hands2": {
       "twin_daggers": [
        152.0,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       121.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        94.4,
        118.0
       ],
       "northern_longsword": [
        82.3,
        107.5
       ],
       "greatsword": [
        62.7,
        90.5
       ],
       "frostblade": [
        86.9,
        111.5
       ],
       "lightbreaker": [
        79.3,
        104.9
       ],
       "dragonbane": [
        77.0,
        102.9
       ],
       "war_hammer": [
        71.7,
        98.3
       ],
       "twin_daggers": [
        115.6,
        136.3
       ],
       "long_spear": [
        58.1,
        86.6
       ],
       "hunters_crossbow": [
        103.5,
        125.9
       ],
       "frostbound_axe": [
        91.4,
        115.4
       ],
       "gatechain_flail": [
        62.7,
        90.5
       ],
       "frostbrand": [
        76.3,
        102.3
       ]
      },
      "hand": [
       148.8,
       165.2
      ],
      "weapon_angle": 229.1,
      "bbox": [
       88,
       87,
       196,
       254
      ],
      "tips2": {
       "twin_daggers": [
        127.9,
        135.2
       ]
      },
      "hands2": {
       "twin_daggers": [
        161.2,
        164.0
       ]
      },
      "shoulder": [
       160.2,
       124.2
      ]
     }
    ],
    "variants": [
     "steel_sword",
     "northern_longsword",
     "greatsword",
     "frostblade",
     "lightbreaker",
     "dragonbane",
     "war_hammer",
     "twin_daggers",
     "long_spear",
     "hunters_crossbow",
     "frostbound_axe",
     "gatechain_flail",
     "unarmed",
     "frostbrand"
    ]
   },
   "jump": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "steel_sword": [
        238.4,
        142.0
       ],
       "northern_longsword": [
        252.2,
        134.0
       ],
       "greatsword": [
        274.7,
        121.0
       ],
       "frostblade": [
        247.0,
        137.0
       ],
       "lightbreaker": [
        255.7,
        132.0
       ],
       "dragonbane": [
        258.3,
        130.5
       ],
       "war_hammer": [
        264.3,
        127.0
       ],
       "twin_daggers": [
        214.1,
        156.0
       ],
       "long_spear": [
        279.9,
        118.0
       ],
       "hunters_crossbow": [
        228.0,
        148.0
       ],
       "frostbound_axe": [
        241.8,
        140.0
       ],
       "gatechain_flail": [
        274.7,
        121.0
       ],
       "frostbrand": [
        259.1,
        130.0
       ]
      },
      "hand": [
       176.0,
       178.0
      ],
      "weapon_angle": 120,
      "bbox": [
       117,
       108,
       242,
       263
      ],
      "tips2": {
       "twin_daggers": [
        202.1,
        160.0
       ]
      },
      "hands2": {
       "twin_daggers": [
        164.0,
        182.0
       ]
      },
      "shoulder": [
       160.3,
       144.8
      ]
     },
     {
      "tips": {
       "steel_sword": [
        191.4,
        62.1
       ],
       "northern_longsword": [
        195.3,
        46.6
       ],
       "greatsword": [
        201.6,
        21.4
       ],
       "frostblade": [
        193.8,
        52.4
       ],
       "lightbreaker": [
        196.3,
        42.7
       ],
       "dragonbane": [
        197.0,
        39.8
       ],
       "war_hammer": [
        198.7,
        33.0
       ],
       "twin_daggers": [
        184.6,
        89.3
       ],
       "long_spear": [
        203.0,
        15.6
       ],
       "hunters_crossbow": [
        188.5,
        73.8
       ],
       "frostbound_axe": [
        192.4,
        58.3
       ],
       "gatechain_flail": [
        201.6,
        21.4
       ],
       "frostbrand": [
        197.2,
        38.9
       ]
      },
      "hand": [
       174.0,
       132.0
      ],
      "weapon_angle": 166,
      "bbox": [
       126,
       59,
       195,
       258
      ],
      "tips2": {
       "twin_daggers": [
        172.6,
        101.3
       ]
      },
      "hands2": {
       "twin_daggers": [
        162.0,
        144.0
       ]
      },
      "shoulder": [
       155.0,
       119.3
      ]
     },
     {
      "tips": {
       "steel_sword": [
        188.0,
        62.7
       ],
       "northern_longsword": [
        190.2,
        46.9
       ],
       "greatsword": [
        193.9,
        21.1
       ],
       "frostblade": [
        189.4,
        52.8
       ],
       "lightbreaker": [
        190.8,
        42.9
       ],
       "dragonbane": [
        191.2,
        39.9
       ],
       "war_hammer": [
        192.2,
        33.0
       ],
       "twin_daggers": [
        184.1,
        90.4
       ],
       "long_spear": [
        194.7,
        15.2
       ],
       "hunters_crossbow": [
        186.4,
        74.6
       ],
       "frostbound_axe": [
        188.6,
        58.7
       ],
       "gatechain_flail": [
        193.9,
        21.1
       ],
       "frostbrand": [
        191.4,
        38.9
       ]
      },
      "hand": [
       178.0,
       134.0
      ],
      "weapon_angle": 172,
      "bbox": [
       101,
       59,
       197,
       238
      ],
      "tips2": {
       "twin_daggers": [
        170.1,
        96.4
       ]
      },
      "hands2": {
       "twin_daggers": [
        164.0,
        140.0
       ]
      },
      "shoulder": [
       152.0,
       113.0
      ]
     },
     {
      "tips": {
       "steel_sword": [
        157.0,
        55.6
       ],
       "northern_longsword": [
        153.7,
        39.9
       ],
       "greatsword": [
        148.3,
        14.5
       ],
       "frostblade": [
        155.0,
        45.8
       ],
       "lightbreaker": [
        152.9,
        36.0
       ],
       "dragonbane": [
        152.2,
        33.1
       ],
       "war_hammer": [
        150.8,
        26.2
       ],
       "twin_daggers": [
        162.9,
        83.0
       ],
       "long_spear": [
        147.1,
        8.6
       ],
       "hunters_crossbow": [
        159.5,
        67.3
       ],
       "frostbound_axe": [
        156.2,
        51.7
       ],
       "gatechain_flail": [
        148.3,
        14.5
       ],
       "frostbrand": [
        152.0,
        32.1
       ]
      },
      "hand": [
       172.0,
       126.0
      ],
      "weapon_angle": 192,
      "bbox": [
       78,
       52,
       200,
       227
      ],
      "tips2": {
       "twin_daggers": [
        152.9,
        91.0
       ]
      },
      "hands2": {
       "twin_daggers": [
        162.0,
        134.0
       ]
      },
      "shoulder": [
       153.5,
       111.1
      ]
     },
     {
      "tips": {
       "steel_sword": [
        200.6,
        76.3
       ],
       "northern_longsword": [
        206.1,
        61.3
       ],
       "greatsword": [
        215.0,
        36.9
       ],
       "frostblade": [
        204.0,
        66.9
       ],
       "lightbreaker": [
        207.5,
        57.5
       ],
       "dragonbane": [
        208.5,
        54.7
       ],
       "war_hammer": [
        210.9,
        48.2
       ],
       "twin_daggers": [
        191.0,
        102.7
       ],
       "long_spear": [
        217.0,
        31.2
       ],
       "hunters_crossbow": [
        196.5,
        87.6
       ],
       "frostbound_axe": [
        202.0,
        72.6
       ],
       "gatechain_flail": [
        215.0,
        36.9
       ],
       "frostbrand": [
        208.8,
        53.8
       ]
      },
      "hand": [
       176.0,
       144.0
      ],
      "weapon_angle": 160,
      "bbox": [
       54,
       73,
       204,
       247
      ],
      "tips2": {
       "twin_daggers": [
        179.0,
        106.7
       ]
      },
      "hands2": {
       "twin_daggers": [
        164.0,
        148.0
       ]
      },
      "shoulder": [
       152.0,
       115.0
      ]
     },
     {
      "tips": {
       "steel_sword": [
        234.2,
        131.7
       ],
       "northern_longsword": [
        247.2,
        122.3
       ],
       "greatsword": [
        268.2,
        107.0
       ],
       "frostblade": [
        242.3,
        125.8
       ],
       "lightbreaker": [
        250.4,
        119.9
       ],
       "dragonbane": [
        252.9,
        118.2
       ],
       "war_hammer": [
        258.5,
        114.0
       ],
       "twin_daggers": [
        211.6,
        148.1
       ],
       "long_spear": [
        273.1,
        103.5
       ],
       "hunters_crossbow": [
        224.5,
        138.7
       ],
       "frostbound_axe": [
        237.5,
        129.3
       ],
       "gatechain_flail": [
        268.2,
        107.0
       ],
       "frostbrand": [
        253.7,
        117.6
       ]
      },
      "hand": [
       176.0,
       174.0
      ],
      "weapon_angle": 126,
      "bbox": [
       104,
       106,
       238,
       263
      ],
      "tips2": {
       "twin_daggers": [
        199.6,
        152.1
       ]
      },
      "hands2": {
       "twin_daggers": [
        164.0,
        178.0
       ]
      },
      "shoulder": [
       158.9,
       142.4
      ]
     }
    ],
    "variants": [
     "steel_sword",
     "northern_longsword",
     "greatsword",
     "frostblade",
     "lightbreaker",
     "dragonbane",
     "war_hammer",
     "twin_daggers",
     "long_spear",
     "hunters_crossbow",
     "frostbound_axe",
     "gatechain_flail",
     "unarmed",
     "frostbrand"
    ]
   },
   "attack": {
    "frames": 7,
    "fps": 14,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "steel_sword": [
        123.6,
        52.7
       ],
       "northern_longsword": [
        116.8,
        38.2
       ],
       "greatsword": [
        105.8,
        14.7
       ],
       "frostblade": [
        119.3,
        43.7
       ],
       "lightbreaker": [
        115.1,
        34.6
       ],
       "dragonbane": [
        113.9,
        31.9
       ],
       "war_hammer": [
        110.9,
        25.6
       ],
       "twin_daggers": [
        135.4,
        78.1
       ],
       "long_spear": [
        103.3,
        9.2
       ],
       "hunters_crossbow": [
        128.6,
        63.6
       ],
       "frostbound_axe": [
        121.9,
        49.1
       ],
       "gatechain_flail": [
        105.8,
        14.7
       ],
       "frostbrand": [
        113.4,
        31.0
       ]
      },
      "hand": [
       154.0,
       118.0
      ],
      "weapon_angle": 205,
      "bbox": [
       110,
       49,
       182,
       256
      ],
      "tips2": {
       "twin_daggers": [
        129.4,
        86.1
       ]
      },
      "hands2": {
       "twin_daggers": [
        148.0,
        126.0
       ]
      },
      "shoulder": [
       143.5,
       128.1
      ]
     },
     {
      "tips": {
       "steel_sword": [
        74.2,
        80.7
       ],
       "northern_longsword": [
        59.6,
        74.2
       ],
       "greatsword": [
        35.9,
        63.6
       ],
       "frostblade": [
        65.1,
        76.6
       ],
       "lightbreaker": [
        56.0,
        72.6
       ],
       "dragonbane": [
        53.2,
        71.4
       ],
       "war_hammer": [
        46.8,
        68.5
       ],
       "twin_daggers": [
        99.8,
        92.1
       ],
       "long_spear": [
        30.4,
        61.2
       ],
       "hunters_crossbow": [
        85.2,
        85.6
       ],
       "frostbound_axe": [
        70.6,
        79.1
       ],
       "gatechain_flail": [
        35.9,
        63.6
       ],
       "frostbrand": [
        52.3,
        71.0
       ]
      },
      "hand": [
       140.0,
       110.0
      ],
      "weapon_angle": 246,
      "bbox": [
       71,
       77,
       182,
       256
      ],
      "tips2": {
       "twin_daggers": [
        97.8,
        100.1
       ]
      },
      "hands2": {
       "twin_daggers": [
        138.0,
        118.0
       ]
      },
      "shoulder": [
       138.5,
       129.3
      ]
     },
     {
      "tips": {
       "steel_sword": [
        187.0,
        43.6
       ],
       "northern_longsword": [
        190.3,
        27.9
       ],
       "greatsword": [
        195.7,
        2.5
       ],
       "frostblade": [
        189.0,
        33.8
       ],
       "lightbreaker": [
        191.1,
        24.0
       ],
       "dragonbane": [
        191.8,
        21.1
       ],
       "war_hammer": [
        193.2,
        14.2
       ],
       "twin_daggers": [
        181.1,
        71.0
       ],
       "long_spear": [
        196.9,
        -3.4
       ],
       "hunters_crossbow": [
        184.5,
        55.3
       ],
       "frostbound_axe": [
        187.8,
        39.7
       ],
       "gatechain_flail": [
        195.7,
        2.5
       ],
       "frostbrand": [
        192.0,
        20.1
       ]
      },
      "hand": [
       172.0,
       114.0
      ],
      "weapon_angle": 168,
      "bbox": [
       106,
       40,
       191,
       256
      ],
      "tips2": {
       "twin_daggers": [
        171.1,
        79.0
       ]
      },
      "hands2": {
       "twin_daggers": [
        162.0,
        122.0
       ]
      },
      "shoulder": [
       156.0,
       130.3
      ]
     },
     {
      "tips": {
       "steel_sword": [
        268.9,
        135.5
       ],
       "northern_longsword": [
        284.7,
        132.7
       ],
       "greatsword": [
        310.3,
        128.2
       ],
       "frostblade": [
        278.8,
        133.8
       ],
       "lightbreaker": [
        288.6,
        132.0
       ],
       "dragonbane": [
        291.6,
        131.5
       ],
       "war_hammer": [
        298.5,
        130.3
       ],
       "twin_daggers": [
        241.3,
        140.4
       ],
       "long_spear": [
        316.2,
        127.2
       ],
       "hunters_crossbow": [
        257.1,
        137.6
       ],
       "frostbound_axe": [
        272.8,
        134.8
       ],
       "gatechain_flail": [
        310.3,
        128.2
       ],
       "frostbrand": [
        292.5,
        131.3
       ]
      },
      "hand": [
       198.0,
       148.0
      ],
      "weapon_angle": 100,
      "bbox": [
       111,
       100,
       272,
       256
      ],
      "tips2": {
       "twin_daggers": [
        225.3,
        146.4
       ]
      },
      "hands2": {
       "twin_daggers": [
        182.0,
        154.0
       ]
      },
      "shoulder": [
       173.2,
       135.8
      ]
     },
     {
      "tips": {
       "steel_sword": [
        246.7,
        228.3
       ],
       "northern_longsword": [
        259.3,
        238.2
       ],
       "greatsword": [
        279.8,
        254.2
       ],
       "frostblade": [
        254.6,
        234.5
       ],
       "lightbreaker": [
        262.5,
        240.6
       ],
       "dragonbane": [
        264.9,
        242.5
       ],
       "war_hammer": [
        270.4,
        246.8
       ],
       "twin_daggers": [
        224.7,
        211.1
       ],
       "long_spear": [
        284.6,
        257.9
       ],
       "hunters_crossbow": [
        237.3,
        220.9
       ],
       "frostbound_axe": [
        249.9,
        230.8
       ],
       "gatechain_flail": [
        279.8,
        254.2
       ],
       "frostbrand": [
        265.6,
        243.1
       ]
      },
      "hand": [
       190.0,
       184.0
      ],
      "weapon_angle": 52,
      "bbox": [
       114,
       104,
       250,
       256
      ],
      "tips2": {
       "twin_daggers": [
        210.7,
        211.1
       ]
      },
      "hands2": {
       "twin_daggers": [
        176.0,
        184.0
       ]
      },
      "shoulder": [
       178.0,
       138.9
      ]
     },
     {
      "tips": {
       "steel_sword": [
        246.8,
        139.0
       ],
       "northern_longsword": [
        261.6,
        133.0
       ],
       "greatsword": [
        285.7,
        123.3
       ],
       "frostblade": [
        256.0,
        135.3
       ],
       "lightbreaker": [
        265.3,
        131.5
       ],
       "dragonbane": [
        268.1,
        130.4
       ],
       "war_hammer": [
        274.6,
        127.8
       ],
       "twin_daggers": [
        220.8,
        149.5
       ],
       "long_spear": [
        291.3,
        121.0
       ],
       "hunters_crossbow": [
        235.6,
        143.5
       ],
       "frostbound_axe": [
        250.5,
        137.5
       ],
       "gatechain_flail": [
        285.7,
        123.3
       ],
       "frostbrand": [
        269.0,
        130.0
       ]
      },
      "hand": [
       180.0,
       166.0
      ],
      "weapon_angle": 112,
      "bbox": [
       107,
       95,
       250,
       256
      ],
      "tips2": {
       "twin_daggers": [
        208.8,
        151.5
       ]
      },
      "hands2": {
       "twin_daggers": [
        168.0,
        168.0
       ]
      },
      "shoulder": [
       163.4,
       132.0
      ]
     },
     {
      "tips": {
       "steel_sword": [
        210.0,
        95.6
       ],
       "northern_longsword": [
        218.0,
        81.8
       ],
       "greatsword": [
        231.0,
        59.3
       ],
       "frostblade": [
        215.0,
        87.0
       ],
       "lightbreaker": [
        220.0,
        78.3
       ],
       "dragonbane": [
        221.5,
        75.7
       ],
       "war_hammer": [
        225.0,
        69.7
       ],
       "twin_daggers": [
        196.0,
        119.9
       ],
       "long_spear": [
        234.0,
        54.1
       ],
       "hunters_crossbow": [
        204.0,
        106.0
       ],
       "frostbound_axe": [
        212.0,
        92.2
       ],
       "gatechain_flail": [
        231.0,
        59.3
       ],
       "frostbrand": [
        222.0,
        74.9
       ]
      },
      "hand": [
       174.0,
       158.0
      ],
      "weapon_angle": 150,
      "bbox": [
       103,
       88,
       213,
       256
      ],
      "tips2": {
       "twin_daggers": [
        186.0,
        123.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        164.0,
        162.0
       ]
      },
      "shoulder": [
       150.0,
       126.0
      ]
     }
    ],
    "variants": [
     "steel_sword",
     "northern_longsword",
     "greatsword",
     "frostblade",
     "lightbreaker",
     "dragonbane",
     "war_hammer",
     "twin_daggers",
     "long_spear",
     "hunters_crossbow",
     "frostbound_axe",
     "gatechain_flail",
     "unarmed",
     "frostbrand"
    ]
   },
   "dodge": {
    "frames": 7,
    "fps": 14,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "steel_sword": [
        250.9,
        185.5
       ],
       "northern_longsword": [
        266.7,
        182.7
       ],
       "greatsword": [
        292.3,
        178.2
       ],
       "frostblade": [
        260.8,
        183.8
       ],
       "lightbreaker": [
        270.6,
        182.0
       ],
       "dragonbane": [
        273.6,
        181.5
       ],
       "war_hammer": [
        280.5,
        180.3
       ],
       "twin_daggers": [
        223.3,
        190.4
       ],
       "long_spear": [
        298.2,
        177.2
       ],
       "hunters_crossbow": [
        239.1,
        187.6
       ],
       "frostbound_axe": [
        254.8,
        184.8
       ],
       "gatechain_flail": [
        292.3,
        178.2
       ],
       "frostbrand": [
        274.5,
        181.3
       ]
      },
      "hand": [
       180.0,
       198.0
      ],
      "weapon_angle": 100,
      "bbox": [
       113,
       123,
       254,
       264
      ],
      "tips2": {
       "twin_daggers": [
        213.3,
        194.4
       ]
      },
      "hands2": {
       "twin_daggers": [
        170.0,
        202.0
       ]
      },
      "shoulder": [
       174.0,
       155.4
      ]
     },
     {
      "tips": {
       "steel_sword": [
        164.0,
        290.2
       ],
       "northern_longsword": [
        164.0,
        306.2
       ],
       "greatsword": [
        164.0,
        332.2
       ],
       "frostblade": [
        164.0,
        300.2
       ],
       "lightbreaker": [
        164.0,
        310.2
       ],
       "dragonbane": [
        164.0,
        313.2
       ],
       "war_hammer": [
        164.0,
        320.2
       ],
       "twin_daggers": [
        164.0,
        262.2
       ],
       "long_spear": [
        164.0,
        338.2
       ],
       "hunters_crossbow": [
        164.0,
        278.2
       ],
       "frostbound_axe": [
        164.0,
        294.2
       ],
       "gatechain_flail": [
        164.0,
        332.2
       ],
       "frostbrand": [
        164.0,
        314.2
       ]
      },
      "hand": [
       164.0,
       218.2
      ],
      "weapon_angle": 0,
      "bbox": [
       88,
       177,
       207,
       272
      ],
      "tips2": {
       "twin_daggers": [
        157.0,
        260.5
       ]
      },
      "hands2": {
       "twin_daggers": [
        157.0,
        216.5
       ]
      },
      "shoulder": [
       176.5,
       233.8
      ]
     },
     {
      "tips": {
       "steel_sword": [
        70.5,
        225.2
       ],
       "northern_longsword": [
        54.7,
        228.0
       ],
       "greatsword": [
        29.1,
        232.5
       ],
       "frostblade": [
        60.7,
        227.0
       ],
       "lightbreaker": [
        50.8,
        228.7
       ],
       "dragonbane": [
        47.9,
        229.2
       ],
       "war_hammer": [
        41.0,
        230.4
       ],
       "twin_daggers": [
        98.1,
        220.4
       ],
       "long_spear": [
        23.2,
        233.6
       ],
       "hunters_crossbow": [
        82.3,
        223.2
       ],
       "frostbound_axe": [
        66.6,
        225.9
       ],
       "gatechain_flail": [
        29.1,
        232.5
       ],
       "frostbrand": [
        46.9,
        229.4
       ]
      },
      "hand": [
       141.4,
       212.7
      ],
      "weapon_angle": 280,
      "bbox": [
       67,
       140,
       179,
       261
      ],
      "tips2": {
       "twin_daggers": [
        98.5,
        213.2
       ]
      },
      "hands2": {
       "twin_daggers": [
        141.9,
        205.5
       ]
      },
      "shoulder": [
       128.3,
       227.7
      ]
     },
     {
      "tips": {
       "steel_sword": [
        118.3,
        121.8
       ],
       "northern_longsword": [
        112.8,
        106.8
       ],
       "greatsword": [
        103.9,
        82.4
       ],
       "frostblade": [
        114.9,
        112.4
       ],
       "lightbreaker": [
        111.4,
        103.0
       ],
       "dragonbane": [
        110.4,
        100.2
       ],
       "war_hammer": [
        108.0,
        93.6
       ],
       "twin_daggers": [
        127.8,
        148.2
       ],
       "long_spear": [
        101.9,
        76.7
       ],
       "hunters_crossbow": [
        122.4,
        133.1
       ],
       "frostbound_axe": [
        116.9,
        118.1
       ],
       "gatechain_flail": [
        103.9,
        82.4
       ],
       "frostbrand": [
        110.1,
        99.3
       ]
      },
      "hand": [
       142.9,
       189.5
      ],
      "weapon_angle": 200,
      "bbox": [
       90,
       118,
       213,
       222
      ],
      "tips2": {
       "twin_daggers": [
        135.0,
        147.4
       ]
      },
      "hands2": {
       "twin_daggers": [
        150.1,
        188.7
       ]
      },
      "shoulder": [
       125.9,
       179.2
      ]
     },
     {
      "tips": {
       "steel_sword": [
        228.4,
        150.9
       ],
       "northern_longsword": [
        242.2,
        142.9
       ],
       "greatsword": [
        264.8,
        129.9
       ],
       "frostblade": [
        237.1,
        145.9
       ],
       "lightbreaker": [
        245.7,
        140.9
       ],
       "dragonbane": [
        248.3,
        139.4
       ],
       "war_hammer": [
        254.4,
        135.9
       ],
       "twin_daggers": [
        204.1,
        164.9
       ],
       "long_spear": [
        270.0,
        126.9
       ],
       "hunters_crossbow": [
        218.0,
        156.9
       ],
       "frostbound_axe": [
        231.9,
        148.9
       ],
       "gatechain_flail": [
        264.8,
        129.9
       ],
       "frostbrand": [
        249.2,
        138.9
       ]
      },
      "hand": [
       166.0,
       186.9
      ],
      "weapon_angle": 120,
      "bbox": [
       133,
       131,
       232,
       257
      ],
      "tips2": {
       "twin_daggers": [
        206.2,
        171.8
       ]
      },
      "hands2": {
       "twin_daggers": [
        168.1,
        193.8
       ]
      },
      "shoulder": [
       173.3,
       168.4
      ]
     },
     {
      "tips": {
       "steel_sword": [
        253.2,
        172.2
       ],
       "northern_longsword": [
        268.6,
        167.7
       ],
       "greatsword": [
        293.6,
        160.6
       ],
       "frostblade": [
        262.8,
        169.4
       ],
       "lightbreaker": [
        272.4,
        166.6
       ],
       "dragonbane": [
        275.3,
        165.8
       ],
       "war_hammer": [
        282.0,
        163.9
       ],
       "twin_daggers": [
        226.3,
        179.9
       ],
       "long_spear": [
        299.4,
        158.9
       ],
       "hunters_crossbow": [
        241.7,
        175.5
       ],
       "frostbound_axe": [
        257.1,
        171.1
       ],
       "gatechain_flail": [
        293.6,
        160.6
       ],
       "frostbrand": [
        276.3,
        165.5
       ]
      },
      "hand": [
       184.0,
       192.0
      ],
      "weapon_angle": 106,
      "bbox": [
       116,
       119,
       257,
       264
      ],
      "tips2": {
       "twin_daggers": [
        214.3,
        183.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        172.0,
        196.0
       ]
      },
      "shoulder": [
       178.5,
       152.6
      ]
     },
     {
      "tips": {
       "steel_sword": [
        226.0,
        114.2
       ],
       "northern_longsword": [
        237.1,
        102.7
       ],
       "greatsword": [
        255.2,
        84.0
       ],
       "frostblade": [
        233.0,
        107.0
       ],
       "lightbreaker": [
        239.9,
        99.8
       ],
       "dragonbane": [
        242.0,
        97.7
       ],
       "war_hammer": [
        246.9,
        92.6
       ],
       "twin_daggers": [
        206.6,
        134.3
       ],
       "long_spear": [
        259.4,
        79.7
       ],
       "hunters_crossbow": [
        217.7,
        122.8
       ],
       "frostbound_axe": [
        228.8,
        111.3
       ],
       "gatechain_flail": [
        255.2,
        84.0
       ],
       "frostbrand": [
        242.7,
        96.9
       ]
      },
      "hand": [
       176.0,
       166.0
      ],
      "weapon_angle": 136,
      "bbox": [
       115,
       98,
       229,
       256
      ],
      "tips2": {
       "twin_daggers": [
        194.6,
        138.3
       ]
      },
      "hands2": {
       "twin_daggers": [
        164.0,
        170.0
       ]
      },
      "shoulder": [
       160.9,
       134.4
      ]
     }
    ],
    "variants": [
     "steel_sword",
     "northern_longsword",
     "greatsword",
     "frostblade",
     "lightbreaker",
     "dragonbane",
     "war_hammer",
     "twin_daggers",
     "long_spear",
     "hunters_crossbow",
     "frostbound_axe",
     "gatechain_flail",
     "unarmed",
     "frostbrand"
    ]
   },
   "hurt": {
    "frames": 4,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "steel_sword": [
        134.7,
        78.2
       ],
       "northern_longsword": [
        128.2,
        63.6
       ],
       "greatsword": [
        117.6,
        39.9
       ],
       "frostblade": [
        130.6,
        69.1
       ],
       "lightbreaker": [
        126.6,
        60.0
       ],
       "dragonbane": [
        125.4,
        57.2
       ],
       "war_hammer": [
        122.5,
        50.8
       ],
       "twin_daggers": [
        146.1,
        103.8
       ],
       "long_spear": [
        115.2,
        34.4
       ],
       "hunters_crossbow": [
        139.6,
        89.2
       ],
       "frostbound_axe": [
        133.1,
        74.6
       ],
       "gatechain_flail": [
        117.6,
        39.9
       ],
       "frostbrand": [
        125.0,
        56.3
       ]
      },
      "hand": [
       164.0,
       144.0
      ],
      "weapon_angle": 204,
      "bbox": [
       104,
       75,
       179,
       256
      ],
      "tips2": {
       "twin_daggers": [
        130.1,
        115.8
       ]
      },
      "hands2": {
       "twin_daggers": [
        148.0,
        156.0
       ]
      },
      "shoulder": [
       127.2,
       126.9
      ]
     },
     {
      "tips": {
       "steel_sword": [
        168.5,
        80.0
       ],
       "northern_longsword": [
        169.1,
        64.1
       ],
       "greatsword": [
        170.0,
        38.1
       ],
       "frostblade": [
        168.9,
        70.0
       ],
       "lightbreaker": [
        169.2,
        60.1
       ],
       "dragonbane": [
        169.3,
        57.1
       ],
       "war_hammer": [
        169.6,
        50.1
       ],
       "twin_daggers": [
        167.5,
        108.0
       ],
       "long_spear": [
        170.2,
        32.1
       ],
       "hunters_crossbow": [
        168.1,
        92.0
       ],
       "frostbound_axe": [
        168.7,
        76.0
       ],
       "gatechain_flail": [
        170.0,
        38.1
       ],
       "frostbrand": [
        169.4,
        56.1
       ]
      },
      "hand": [
       166.0,
       152.0
      ],
      "weapon_angle": 178,
      "bbox": [
       102,
       77,
       182,
       256
      ],
      "tips2": {
       "twin_daggers": [
        153.5,
        116.0
       ]
      },
      "hands2": {
       "twin_daggers": [
        152.0,
        160.0
       ]
      },
      "shoulder": [
       129.5,
       128.8
      ]
     },
     {
      "tips": {
       "steel_sword": [
        196.6,
        88.3
       ],
       "northern_longsword": [
        202.1,
        73.3
       ],
       "greatsword": [
        211.0,
        48.9
       ],
       "frostblade": [
        200.0,
        78.9
       ],
       "lightbreaker": [
        203.5,
        69.5
       ],
       "dragonbane": [
        204.5,
        66.7
       ],
       "war_hammer": [
        206.9,
        60.2
       ],
       "twin_daggers": [
        187.0,
        114.7
       ],
       "long_spear": [
        213.0,
        43.2
       ],
       "hunters_crossbow": [
        192.5,
        99.6
       ],
       "frostbound_axe": [
        198.0,
        84.6
       ],
       "gatechain_flail": [
        211.0,
        48.9
       ],
       "frostbrand": [
        204.8,
        65.8
       ]
      },
      "hand": [
       172.0,
       156.0
      ],
      "weapon_angle": 160,
      "bbox": [
       101,
       85,
       200,
       256
      ],
      "tips2": {
       "twin_daggers": [
        175.0,
        120.7
       ]
      },
      "hands2": {
       "twin_daggers": [
        160.0,
        162.0
       ]
      },
      "shoulder": [
       141.5,
       128.1
      ]
     },
     {
      "tips": {
       "steel_sword": [
        210.0,
        95.6
       ],
       "northern_longsword": [
        218.0,
        81.8
       ],
       "greatsword": [
        231.0,
        59.3
       ],
       "frostblade": [
        215.0,
        87.0
       ],
       "lightbreaker": [
        220.0,
        78.3
       ],
       "dragonbane": [
        221.5,
        75.7
       ],
       "war_hammer": [
        225.0,
        69.7
       ],
       "twin_daggers": [
        196.0,
        119.9
       ],
       "long_spear": [
        234.0,
        54.1
       ],
       "hunters_crossbow": [
        204.0,
        106.0
       ],
       "frostbound_axe": [
        212.0,
        92.2
       ],
       "gatechain_flail": [
        231.0,
        59.3
       ],
       "frostbrand": [
        222.0,
        74.9
       ]
      },
      "hand": [
       174.0,
       158.0
      ],
      "weapon_angle": 150,
      "bbox": [
       109,
       88,
       213,
       256
      ],
      "tips2": {
       "twin_daggers": [
        186.0,
        123.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        164.0,
        162.0
       ]
      },
      "shoulder": [
       150.0,
       126.0
      ]
     }
    ],
    "variants": [
     "steel_sword",
     "northern_longsword",
     "greatsword",
     "frostblade",
     "lightbreaker",
     "dragonbane",
     "war_hammer",
     "twin_daggers",
     "long_spear",
     "hunters_crossbow",
     "frostbound_axe",
     "gatechain_flail",
     "unarmed",
     "frostbrand"
    ]
   },
   "death": {
    "frames": 8,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "steel_sword": [
        127.8,
        78.9
       ],
       "northern_longsword": [
        119.4,
        65.4
       ],
       "greatsword": [
        105.6,
        43.3
       ],
       "frostblade": [
        122.5,
        70.5
       ],
       "lightbreaker": [
        117.2,
        62.0
       ],
       "dragonbane": [
        115.7,
        59.4
       ],
       "war_hammer": [
        111.9,
        53.5
       ],
       "twin_daggers": [
        142.7,
        102.7
       ],
       "long_spear": [
        102.4,
        38.2
       ],
       "hunters_crossbow": [
        134.2,
        89.1
       ],
       "frostbound_axe": [
        125.7,
        75.5
       ],
       "gatechain_flail": [
        105.6,
        43.3
       ],
       "frostbrand": [
        115.1,
        58.6
       ]
      },
      "hand": [
       166.0,
       140.0
      ],
      "weapon_angle": 212,
      "bbox": [
       102,
       76,
       179,
       256
      ],
      "tips2": {
       "twin_daggers": [
        122.7,
        114.7
       ]
      },
      "hands2": {
       "twin_daggers": [
        146.0,
        152.0
       ]
      },
      "shoulder": [
       126.4,
       127.9
      ]
     },
     {
      "tips": {
       "steel_sword": [
        206.2,
        230.0
       ],
       "northern_longsword": [
        216.4,
        242.2
       ],
       "greatsword": [
        233.2,
        262.1
       ],
       "frostblade": [
        212.6,
        237.6
       ],
       "lightbreaker": [
        219.0,
        245.3
       ],
       "dragonbane": [
        220.9,
        247.6
       ],
       "war_hammer": [
        225.4,
        253.0
       ],
       "twin_daggers": [
        188.2,
        208.5
       ],
       "long_spear": [
        237.0,
        266.7
       ],
       "hunters_crossbow": [
        198.4,
        220.8
       ],
       "frostbound_axe": [
        208.7,
        233.0
       ],
       "gatechain_flail": [
        233.2,
        262.1
       ],
       "frostbrand": [
        221.6,
        248.4
       ]
      },
      "hand": [
       159.9,
       174.8
      ],
      "weapon_angle": 40,
      "bbox": [
       102,
       92,
       210,
       256
      ],
      "tips2": {
       "twin_daggers": [
        174.3,
        211.7
       ]
      },
      "hands2": {
       "twin_daggers": [
        146.0,
        178.0
       ]
      },
      "shoulder": [
       131.0,
       131.6
      ]
     },
     {
      "tips": {
       "steel_sword": [
        185.3,
        271.3
       ],
       "northern_longsword": [
        189.7,
        286.7
       ],
       "greatsword": [
        196.9,
        311.7
       ],
       "frostblade": [
        188.1,
        280.9
       ],
       "lightbreaker": [
        190.8,
        290.5
       ],
       "dragonbane": [
        191.7,
        293.4
       ],
       "war_hammer": [
        193.6,
        300.2
       ],
       "twin_daggers": [
        177.6,
        244.4
       ],
       "long_spear": [
        198.5,
        317.5
       ],
       "hunters_crossbow": [
        182.0,
        259.8
       ],
       "frostbound_axe": [
        186.4,
        275.2
       ],
       "gatechain_flail": [
        196.9,
        311.7
       ],
       "frostbrand": [
        191.9,
        294.4
       ]
      },
      "hand": [
       165.5,
       202.1
      ],
      "weapon_angle": 16,
      "bbox": [
       111,
       117,
       191,
       272
      ],
      "tips2": {
       "twin_daggers": [
        164.1,
        244.3
       ]
      },
      "hands2": {
       "twin_daggers": [
        152.0,
        202.0
       ]
      },
      "shoulder": [
       151.4,
       152.0
      ]
     },
     {
      "tips": {
       "steel_sword": [
        179.7,
        290.0
       ],
       "northern_longsword": [
        181.9,
        305.8
       ],
       "greatsword": [
        185.5,
        331.6
       ],
       "frostblade": [
        181.1,
        299.9
       ],
       "lightbreaker": [
        182.5,
        309.8
       ],
       "dragonbane": [
        182.9,
        312.8
       ],
       "war_hammer": [
        183.9,
        319.7
       ],
       "twin_daggers": [
        175.8,
        262.3
       ],
       "long_spear": [
        186.4,
        337.5
       ],
       "hunters_crossbow": [
        178.0,
        278.1
       ],
       "frostbound_axe": [
        180.2,
        293.9
       ],
       "gatechain_flail": [
        185.5,
        331.6
       ],
       "frostbrand": [
        183.0,
        313.8
       ]
      },
      "hand": [
       169.7,
       218.7
      ],
      "weapon_angle": 8,
      "bbox": [
       100,
       135,
       196,
       272
      ],
      "tips2": {
       "twin_daggers": [
        162.3,
        261.9
       ]
      },
      "hands2": {
       "twin_daggers": [
        156.1,
        218.3
       ]
      },
      "shoulder": [
       159.2,
       167.8
      ]
     },
     {
      "tips": {},
      "hand": [
       182.0,
       224.0
      ],
      "weapon_angle": 150,
      "bbox": [
       94,
       164,
       267,
       272
      ],
      "shoulder": [
       179.3,
       188.7
      ]
     },
     {
      "tips": {},
      "hand": [
       204.0,
       242.0
      ],
      "weapon_angle": 150,
      "bbox": [
       72,
       194,
       267,
       272
      ],
      "shoulder": [
       183.1,
       217.2
      ]
     },
     {
      "tips": {},
      "hand": [
       216.0,
       247.0
      ],
      "weapon_angle": 150,
      "bbox": [
       51,
       211,
       267,
       272
      ],
      "shoulder": [
       177.0,
       237.0
      ]
     },
     {
      "tips": {},
      "hand": [
       216.0,
       247.0
      ],
      "weapon_angle": 150,
      "bbox": [
       51,
       211,
       267,
       272
      ],
      "shoulder": [
       177.0,
       237.0
      ]
     }
    ],
    "variants": [
     "steel_sword",
     "northern_longsword",
     "greatsword",
     "frostblade",
     "lightbreaker",
     "dragonbane",
     "war_hammer",
     "twin_daggers",
     "long_spear",
     "hunters_crossbow",
     "frostbound_axe",
     "gatechain_flail",
     "unarmed",
     "frostbrand"
    ]
   },
   "heavy": {
    "frames": 8,
    "fps": 11,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "greatsword": [
        183.8,
        25.7
       ],
       "war_hammer": [
        181.7,
        37.5
       ]
      },
      "hand": [
       164.0,
       138.0
      ],
      "weapon_angle": 170,
      "bbox": [
       113,
       22,
       189,
       256
      ]
     },
     {
      "tips": {
       "greatsword": [
        102.0,
        9.5
       ],
       "war_hammer": [
        107.3,
        20.3
       ]
      },
      "hand": [
       152.0,
       112.0
      ],
      "weapon_angle": 206,
      "bbox": [
       99,
       6,
       184,
       256
      ]
     },
     {
      "tips": {
       "greatsword": [
        54.2,
        31.8
       ],
       "war_hammer": [
        63.6,
        39.2
       ]
      },
      "hand": [
       144.0,
       102.0
      ],
      "weapon_angle": 232,
      "bbox": [
       51,
       28,
       184,
       256
      ]
     },
     {
      "tips": {
       "greatsword": [
        233.0,
        15.3
       ],
       "war_hammer": [
        227.0,
        25.7
       ]
      },
      "hand": [
       176.0,
       114.0
      ],
      "weapon_angle": 150,
      "bbox": [
       107,
       12,
       236,
       256
      ]
     },
     {
      "tips": {
       "greatsword": [
        314.3,
        185.8
       ],
       "war_hammer": [
        302.5,
        183.7
       ]
      },
      "hand": [
       202.0,
       166.0
      ],
      "weapon_angle": 80,
      "bbox": [
       114,
       110,
       318,
       256
      ]
     },
     {
      "tips": {
       "greatsword": [
        286.8,
        272.1
       ],
       "war_hammer": [
        277.4,
        264.7
       ]
      },
      "hand": [
       197.0,
       201.9
      ],
      "weapon_angle": 52,
      "bbox": [
       113,
       117,
       290,
       272
      ]
     },
     {
      "tips": {
       "greatsword": [
        290.1,
        230.4
       ],
       "war_hammer": [
        279.2,
        225.5
       ]
      },
      "hand": [
       186.0,
       184.0
      ],
      "weapon_angle": 66,
      "bbox": [
       115,
       107,
       293,
       263
      ]
     },
     {
      "tips": {
       "greatsword": [
        243.3,
        60.7
       ],
       "war_hammer": [
        235.6,
        69.9
       ]
      },
      "hand": [
       170.0,
       148.0
      ],
      "weapon_angle": 140,
      "bbox": [
       105,
       57,
       247,
       256
      ]
     }
    ],
    "variants": [
     "greatsword",
     "war_hammer"
    ]
   },
   "thrust": {
    "frames": 6,
    "fps": 13,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "long_spear": [
        289.3,
        143.5
       ]
      },
      "hand": [
       170.0,
       156.0
      ],
      "weapon_angle": 96,
      "bbox": [
       113,
       91,
       293,
       256
      ]
     },
     {
      "tips": {
       "long_spear": [
        273.7,
        143.6
       ]
      },
      "hand": [
       154.0,
       152.0
      ],
      "weapon_angle": 94,
      "bbox": [
       96,
       90,
       277,
       256
      ]
     },
     {
      "tips": {
       "long_spear": [
        322.0,
        146.0
       ]
      },
      "hand": [
       202.0,
       146.0
      ],
      "weapon_angle": 90,
      "bbox": [
       118,
       100,
       325,
       256
      ]
     },
     {
      "tips": {
       "long_spear": [
        330.0,
        144.0
       ]
      },
      "hand": [
       210.0,
       144.0
      ],
      "weapon_angle": 90,
      "bbox": [
       118,
       103,
       333,
       256
      ]
     },
     {
      "tips": {
       "long_spear": [
        303.8,
        143.7
       ]
      },
      "hand": [
       184.0,
       150.0
      ],
      "weapon_angle": 93,
      "bbox": [
       108,
       94,
       307,
       256
      ]
     },
     {
      "tips": {
       "long_spear": [
        291.3,
        143.5
       ]
      },
      "hand": [
       172.0,
       156.0
      ],
      "weapon_angle": 96,
      "bbox": [
       105,
       91,
       295,
       256
      ]
     }
    ],
    "variants": [
     "long_spear"
    ]
   },
   "daggers": {
    "frames": 6,
    "fps": 17,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "twin_daggers": [
        211.3,
        141.0
       ]
      },
      "hand": [
       170.0,
       156.0
      ],
      "weapon_angle": 110,
      "bbox": [
       118,
       94,
       215,
       256
      ],
      "tips2": {
       "twin_daggers": [
        198.1,
        140.0
       ]
      },
      "hands2": {
       "twin_daggers": [
        160.0,
        162.0
       ]
      }
     },
     {
      "tips": {
       "twin_daggers": [
        248.0,
        150.5
       ]
      },
      "hand": [
       204.0,
       152.0
      ],
      "weapon_angle": 92,
      "bbox": [
       118,
       100,
       251,
       256
      ],
      "tips2": {
       "twin_daggers": [
        188.6,
        136.3
       ]
      },
      "hands2": {
       "twin_daggers": [
        158.0,
        168.0
       ]
      }
     },
     {
      "tips": {
       "twin_daggers": [
        220.8,
        143.5
       ]
      },
      "hand": [
       180.0,
       160.0
      ],
      "weapon_angle": 112,
      "bbox": [
       115,
       96,
       224,
       256
      ],
      "tips2": {
       "twin_daggers": [
        214.8,
        139.5
       ]
      },
      "hands2": {
       "twin_daggers": [
        174.0,
        156.0
       ]
      }
     },
     {
      "tips": {
       "twin_daggers": [
        203.7,
        137.4
       ]
      },
      "hand": [
       172.0,
       168.0
      ],
      "weapon_angle": 134,
      "bbox": [
       115,
       101,
       249,
       256
      ],
      "tips2": {
       "twin_daggers": [
        246.0,
        148.0
       ]
      },
      "hands2": {
       "twin_daggers": [
        202.0,
        148.0
       ]
      }
     },
     {
      "tips": {
       "twin_daggers": [
        212.3,
        110.3
       ]
      },
      "hand": [
       184.0,
       144.0
      ],
      "weapon_angle": 140,
      "bbox": [
       109,
       95,
       218,
       256
      ],
      "tips2": {
       "twin_daggers": [
        214.8,
        141.3
       ]
      },
      "hands2": {
       "twin_daggers": [
        176.0,
        162.0
       ]
      }
     },
     {
      "tips": {
       "twin_daggers": [
        212.8,
        139.5
       ]
      },
      "hand": [
       172.0,
       156.0
      ],
      "weapon_angle": 112,
      "bbox": [
       105,
       93,
       216,
       256
      ],
      "tips2": {
       "twin_daggers": [
        199.3,
        138.7
       ]
      },
      "hands2": {
       "twin_daggers": [
        162.0,
        162.0
       ]
      }
     }
    ],
    "variants": [
     "twin_daggers"
    ]
   },
   "shoot": {
    "frames": 4,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "hunters_crossbow": [
        226.0,
        112.0
       ]
      },
      "hand": [
       174.0,
       142.0
      ],
      "weapon_angle": 120,
      "bbox": [
       115,
       88,
       229,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        234.0,
        126.0
       ]
      },
      "hand": [
       174.0,
       126.0
      ],
      "weapon_angle": 90,
      "bbox": [
       109,
       89,
       237,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        228.6,
        116.7
       ]
      },
      "hand": [
       169.0,
       124.0
      ],
      "weapon_angle": 97,
      "bbox": [
       105,
       88,
       232,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        229.6,
        113.5
       ]
      },
      "hand": [
       174.0,
       136.0
      ],
      "weapon_angle": 112,
      "bbox": [
       107,
       89,
       233,
       256
      ]
     }
    ],
    "variants": [
     "hunters_crossbow"
    ]
   },
   "reload": {
    "frames": 6,
    "fps": 6,
    "loop": false,
    "per_frame": [
     {
      "tips": {
       "hunters_crossbow": [
        200.4,
        220.8
       ]
      },
      "hand": [
       176.0,
       166.0
      ],
      "weapon_angle": 24,
      "bbox": [
       118,
       99,
       220,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        200.4,
        220.8
       ]
      },
      "hand": [
       176.0,
       166.0
      ],
      "weapon_angle": 24,
      "bbox": [
       118,
       99,
       220,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        200.4,
        220.8
       ]
      },
      "hand": [
       176.0,
       166.0
      ],
      "weapon_angle": 24,
      "bbox": [
       118,
       99,
       220,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        200.4,
        220.8
       ]
      },
      "hand": [
       176.0,
       166.0
      ],
      "weapon_angle": 24,
      "bbox": [
       113,
       99,
       220,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        200.4,
        220.8
       ]
      },
      "hand": [
       176.0,
       166.0
      ],
      "weapon_angle": 24,
      "bbox": [
       110,
       99,
       220,
       256
      ]
     },
     {
      "tips": {
       "hunters_crossbow": [
        200.4,
        220.8
       ]
      },
      "hand": [
       176.0,
       166.0
      ],
      "weapon_angle": 24,
      "bbox": [
       110,
       99,
       220,
       256
      ]
     }
    ],
    "variants": [
     "hunters_crossbow"
    ]
   },
   "deploy": {
    "frames": 5,
    "fps": 12,
    "loop": false,
    "per_frame": [
     {
      "tips": {},
      "hand": [
       174.0,
       158.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       150.0,
       127.0
      ],
      "bbox": [
       114,
       89,
       192,
       255
      ]
     },
     {
      "tips": {},
      "hand": [
       150.0,
       112.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       142.0,
       128.2
      ],
      "bbox": [
       107,
       89,
       192,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       134.0,
       116.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       137.0,
       129.6
      ],
      "bbox": [
       97,
       90,
       192,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       164.0,
       128.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       143.5,
       130.1
      ],
      "bbox": [
       103,
       91,
       192,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       148.5,
       131.0
      ],
      "bbox": [
       107,
       92,
       192,
       256
      ]
     }
    ],
    "variants": [
     "unarmed"
    ]
   },
   "aim": {
    "frames": 4,
    "fps": 4,
    "loop": true,
    "per_frame": [
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       148.5,
       131.0
      ],
      "bbox": [
       112,
       92,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.8
      ],
      "weapon_angle": 90,
      "shoulder": [
       148.5,
       131.8
      ],
      "bbox": [
       110,
       93,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       148.5,
       131.0
      ],
      "bbox": [
       105,
       92,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       143.2
      ],
      "weapon_angle": 90,
      "shoulder": [
       148.5,
       130.2
      ],
      "bbox": [
       112,
       91,
       194,
       256
      ]
     }
    ],
    "variants": [
     "unarmed"
    ]
   },
   "pfire": {
    "frames": 3,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "tips": {},
      "hand": [
       172.0,
       146.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       133.5,
       133.8
      ],
      "bbox": [
       106,
       94,
       192,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       170.0,
       148.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       130.1,
       134.1
      ],
      "bbox": [
       104,
       94,
       192,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       177.0,
       145.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       141.0,
       132.2
      ],
      "bbox": [
       109,
       93,
       194,
       256
      ]
     }
    ],
    "variants": [
     "unarmed"
    ]
   },
   "preload": {
    "frames": 6,
    "fps": 6,
    "loop": false,
    "per_frame": [
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       148.5,
       131.0
      ],
      "bbox": [
       112,
       92,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       144.5,
       131.1
      ],
      "bbox": [
       110,
       92,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       140.5,
       131.3
      ],
      "bbox": [
       102,
       92,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       142.0,
       131.2
      ],
      "bbox": [
       103,
       92,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       145.2,
       131.0
      ],
      "bbox": [
       104,
       92,
       194,
       256
      ]
     },
     {
      "tips": {},
      "hand": [
       180.0,
       144.0
      ],
      "weapon_angle": 90,
      "shoulder": [
       148.5,
       131.0
      ],
      "bbox": [
       106,
       92,
       194,
       256
      ]
     }
    ],
    "variants": [
     "unarmed"
    ]
   }
  },
  "styles": {
   "greatsword": "heavy",
   "war_hammer": "heavy",
   "long_spear": "spear",
   "twin_daggers": "daggers",
   "hunters_crossbow": "crossbow"
  }
 },
 "dragon_fire": {
  "base": "sprites/dragon_fire/dragon_fire_base.png",
  "frame_size": [
   768,
   512
  ],
  "facing": "left",
  "pivot": [
   384,
   486
  ],
  "recommended_scale_1080p": 1.25,
  "sheet_pattern": "sprites/dragon_fire/sheets/dragon_fire_{anim}.png",
  "frames_pattern": "sprites/dragon_fire/frames/{anim}/dragon_fire_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       693,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       695,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       692,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       688,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       687,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       690,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       223,
       696,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       218,
       698,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       300.6
      ],
      "fire_angle": 287.6,
      "head": [
       167.5,
       271.9
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       120,
       214,
       697,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       218,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       223,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       224,
       689,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.4,
       309.4
      ],
      "fire_angle": 287.6,
      "head": [
       159.0,
       280.7
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       111,
       223,
       691,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       224,
       693,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       180.4,
       238.7
      ],
      "fire_angle": 264.8,
      "head": [
       215.8,
       224.4
      ],
      "chest": [
       310.0,
       350.0
      ],
      "bbox": [
       163,
       64,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.2,
       209.3
      ],
      "fire_angle": 253.2,
      "head": [
       254.5,
       197.0
      ],
      "chest": [
       320.0,
       340.0
      ],
      "bbox": [
       203,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       116.9,
       403.8
      ],
      "fire_angle": 311.6,
      "head": [
       110.4,
       347.2
      ],
      "chest": [
       272.0,
       368.0
      ],
      "bbox": [
       68,
       126,
       683,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       81.3,
       404.1
      ],
      "fire_angle": 302.8,
      "head": [
       100.4,
       371.0
      ],
      "chest": [
       264.0,
       372.0
      ],
      "bbox": [
       59,
       150,
       675,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       97.8,
       375.9
      ],
      "fire_angle": 300.0,
      "head": [
       114.8,
       337.2
      ],
      "chest": [
       274.0,
       368.0
      ],
      "bbox": [
       71,
       104,
       678,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.7,
       317.5
      ],
      "fire_angle": 291.6,
      "head": [
       157.2,
       287.0
      ],
      "chest": [
       294.0,
       362.0
      ],
      "bbox": [
       111,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       237.9
      ],
      "fire_angle": 261.6,
      "head": [
       211.4,
       223.7
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       158,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       221.2,
       199.9
      ],
      "fire_angle": 246.0,
      "head": [
       262.5,
       191.0
      ],
      "chest": [
       318.0,
       340.0
      ],
      "bbox": [
       205,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.9,
       342.5
      ],
      "fire_angle": 292.4,
      "head": [
       133.8,
       293.2
      ],
      "chest": [
       282.0,
       360.0
      ],
      "bbox": [
       84,
       66,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       108.2,
       377.0
      ],
      "fire_angle": 298.8,
      "head": [
       115.4,
       321.8
      ],
      "chest": [
       274.0,
       364.0
      ],
      "bbox": [
       67,
       85,
       684,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       109.2,
       374.2
      ],
      "fire_angle": 297.7,
      "head": [
       116.6,
       317.9
      ],
      "chest": [
       274.0,
       364.9
      ],
      "bbox": [
       68,
       83,
       682,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.5,
       378.8
      ],
      "fire_angle": 299.5,
      "head": [
       114.7,
       324.4
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       679,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.6,
       378.6
      ],
      "fire_angle": 299.5,
      "head": [
       114.8,
       324.1
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       676,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       129.5,
       319.5
      ],
      "fire_angle": 291.2,
      "head": [
       153.0,
       285.7
      ],
      "chest": [
       290.0,
       362.0
      ],
      "bbox": [
       106,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       254.4,
       193.6
      ],
      "fire_angle": 230.4,
      "head": [
       305.4,
       184.5
      ],
      "chest": [
       322.0,
       344.0
      ],
      "bbox": [
       241,
       31,
       709,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       235.8,
       208.6
      ],
      "fire_angle": 241.2,
      "head": [
       281.2,
       196.6
      ],
      "chest": [
       328.0,
       350.0
      ],
      "bbox": [
       227,
       58,
       712,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.9,
       253.5
      ],
      "fire_angle": 267.2,
      "head": [
       219.1,
       232.1
      ],
      "chest": [
       316.0,
       356.0
      ],
      "bbox": [
       167,
       94,
       704,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.5,
       294.5
      ],
      "fire_angle": 285.6,
      "head": [
       179.0,
       266.7
      ],
      "chest": [
       302.0,
       360.0
      ],
      "bbox": [
       130,
       97,
       692,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       220.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       200.6
      ],
      "chest": [
       292.0,
       276.0
      ],
      "bbox": [
       91,
       0,
       697,
       383
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       698,
       386
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       27,
       698,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       175,
       696,
       451
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       240.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       220.6
      ],
      "chest": [
       292.0,
       296.0
      ],
      "bbox": [
       91,
       178,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       175,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       130,
       695,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       696,
       386
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       244.1,
       200.5
      ],
      "fire_angle": 235.2,
      "head": [
       295.0,
       185.6
      ],
      "chest": [
       318.0,
       344.0
      ],
      "bbox": [
       235,
       31,
       707,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       279.7,
       166.0
      ],
      "fire_angle": 223.6,
      "head": [
       335.9,
       157.5
      ],
      "chest": [
       332.0,
       318.0
      ],
      "bbox": [
       262,
       4,
       711,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.3,
       225.6
      ],
      "fire_angle": 249.6,
      "head": [
       256.0,
       201.9
      ],
      "chest": [
       324.0,
       350.0
      ],
      "bbox": [
       202,
       106,
       706,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.1,
       345.4
      ],
      "fire_angle": 276.4,
      "head": [
       162.6,
       311.3
      ],
      "chest": [
       308.0,
       392.0
      ],
      "bbox": [
       111,
       128,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       106.9,
       450.1
      ],
      "fire_angle": 284.0,
      "head": [
       134.0,
       417.6
      ],
      "chest": [
       300.0,
       428.0
      ],
      "bbox": [
       84,
       164,
       690,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.2,
       477.3
      ],
      "fire_angle": 278.4,
      "head": [
       128.8,
       451.3
      ],
      "chest": [
       296.0,
       448.0
      ],
      "bbox": [
       78,
       284,
       673,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.6,
       473.2
      ],
      "fire_angle": 269.6,
      "head": [
       126.7,
       454.1
      ],
      "chest": [
       294.0,
       452.0
      ],
      "bbox": [
       75,
       288,
       658,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       472.5
      ],
      "fire_angle": 267.2,
      "head": [
       127.0,
       455.8
      ],
      "chest": [
       294.0,
       454.0
      ],
      "bbox": [
       75,
       290,
       658,
       512
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "backgrounds": {
  "frozen_wall": {
   "combined": "backgrounds/frozen_wall/frozen_wall_bg.png",
   "size": [
    3840,
    1080
   ],
   "tileable_x": true,
   "floor_y": 900,
   "layers": [
    {
     "id": "sky",
     "file": "backgrounds/frozen_wall/frozen_wall_sky.png",
     "parallax": 0.05
    },
    {
     "id": "far",
     "file": "backgrounds/frozen_wall/frozen_wall_far.png",
     "parallax": 0.15,
     "note": "mountains + ice wall, transparent sky"
    },
    {
     "id": "mid",
     "file": "backgrounds/frozen_wall/frozen_wall_mid_ruins.png",
     "parallax": 0.45
    },
    {
     "id": "fg",
     "file": "backgrounds/frozen_wall/frozen_wall_fg_battlements.png",
     "parallax": 1.0,
     "note": "walkable floor at floor_y"
    },
    {
     "id": "cover",
     "file": "backgrounds/frozen_wall/frozen_wall_cover.png",
     "parallax": 1.0,
     "optional": true
    }
   ],
   "props": {
    "cover_barricade": {
     "file": "backgrounds/frozen_wall/props/cover_barricade.png",
     "size": [
      300,
      190
     ],
     "ground_y": 186
    },
    "cover_crates": {
     "file": "backgrounds/frozen_wall/props/cover_crates.png",
     "size": [
      240,
      220
     ],
     "ground_y": 212
    },
    "cover_stone_block": {
     "file": "backgrounds/frozen_wall/props/cover_stone_block.png",
     "size": [
      230,
      150
     ],
     "ground_y": 142
    },
    "cover_ice_boulder": {
     "file": "backgrounds/frozen_wall/props/cover_ice_boulder.png",
     "size": [
      240,
      180
     ],
     "ground_y": 172
    }
   },
   "cover_placements": [
    {
     "prop": "cover_crates",
     "x": 700,
     "y": 692,
     "w": 240,
     "h": 220
    },
    {
     "prop": "cover_barricade",
     "x": 1450,
     "y": 718,
     "w": 300,
     "h": 190
    },
    {
     "prop": "cover_stone_block",
     "x": 2150,
     "y": 762,
     "w": 230,
     "h": 150
    },
    {
     "prop": "cover_ice_boulder",
     "x": 2850,
     "y": 732,
     "w": 240,
     "h": 180
    },
    {
     "prop": "cover_barricade",
     "x": 3450,
     "y": 718,
     "w": 300,
     "h": 190
    }
   ]
  },
  "burning_keep": {
   "combined": "backgrounds/burning_keep/burning_keep_bg.png",
   "size": [
    3840,
    1080
   ],
   "tileable_x": true,
   "floor_y": 900,
   "layers": [
    {
     "id": "sky",
     "file": "backgrounds/burning_keep/burning_keep_sky.png",
     "parallax": 0.05
    },
    {
     "id": "far",
     "file": "backgrounds/burning_keep/burning_keep_far.png",
     "parallax": 0.15,
     "note": "mountains + ice wall, transparent sky"
    },
    {
     "id": "mid",
     "file": "backgrounds/burning_keep/burning_keep_mid_ruins.png",
     "parallax": 0.45
    },
    {
     "id": "fg",
     "file": "backgrounds/burning_keep/burning_keep_fg_battlements.png",
     "parallax": 1.0,
     "note": "walkable floor at floor_y"
    },
    {
     "id": "cover",
     "file": "backgrounds/burning_keep/burning_keep_cover.png",
     "parallax": 1.0,
     "optional": true
    }
   ],
   "props": {
    "cover_broken_wall": {
     "file": "backgrounds/burning_keep/props/cover_broken_wall.png",
     "size": [
      240,
      210
     ],
     "ground_y": 204,
     "states": {
      "cracked": "backgrounds/burning_keep/props/cover_broken_wall_cracked.png",
      "rubble": "backgrounds/burning_keep/props/cover_broken_wall_rubble.png"
     }
    },
    "platform_cracked": {
     "file": "backgrounds/burning_keep/props/platform_cracked.png",
     "size": [
      340,
      270
     ],
     "ground_y": 266,
     "slab": [
      8,
      58,
      326,
      44
     ]
    }
   },
   "cover_placements": [
    {
     "prop": "cover_broken_wall",
     "x": 900,
     "y": 700,
     "w": 240,
     "h": 210
    },
    {
     "prop": "platform_cracked",
     "x": 1700,
     "y": 638,
     "w": 340,
     "h": 270
    },
    {
     "prop": "cover_broken_wall",
     "x": 2500,
     "y": 700,
     "w": 240,
     "h": 210
    },
    {
     "prop": "platform_cracked",
     "x": 3300,
     "y": 638,
     "w": 340,
     "h": 270
    }
   ]
  },
  "ice_gate": {
   "combined": "backgrounds/ice_gate/ice_gate_bg.png",
   "size": [
    3840,
    1080
   ],
   "tileable_x": true,
   "floor_y": 900,
   "layers": [
    {
     "id": "sky",
     "file": "backgrounds/ice_gate/ice_gate_sky.png",
     "parallax": 0.05
    },
    {
     "id": "far",
     "file": "backgrounds/ice_gate/ice_gate_far.png",
     "parallax": 0.15,
     "note": "mountains + ice wall, transparent sky"
    },
    {
     "id": "mid",
     "file": "backgrounds/ice_gate/ice_gate_mid_ruins.png",
     "parallax": 0.45
    },
    {
     "id": "fg",
     "file": "backgrounds/ice_gate/ice_gate_fg_battlements.png",
     "parallax": 1.0,
     "note": "walkable floor at floor_y"
    },
    {
     "id": "cover",
     "file": "backgrounds/ice_gate/ice_gate_cover.png",
     "parallax": 1.0,
     "optional": true
    }
   ],
   "props": {
    "cover_broken_wall": {
     "file": "backgrounds/ice_gate/props/cover_broken_wall.png",
     "size": [
      240,
      210
     ],
     "ground_y": 204,
     "states": {
      "cracked": "backgrounds/ice_gate/props/cover_broken_wall_cracked.png",
      "rubble": "backgrounds/ice_gate/props/cover_broken_wall_rubble.png"
     }
    },
    "cover_ice_spike": {
     "file": "backgrounds/ice_gate/props/cover_ice_spike.png",
     "size": [
      240,
      230
     ],
     "ground_y": 224
    },
    "platform_cracked": {
     "file": "backgrounds/ice_gate/props/platform_cracked.png",
     "size": [
      340,
      270
     ],
     "ground_y": 266,
     "slab": [
      8,
      58,
      326,
      44
     ]
    }
   },
   "cover_placements": [
    {
     "prop": "cover_ice_spike",
     "x": 900,
     "y": 680,
     "w": 240,
     "h": 230
    },
    {
     "prop": "cover_broken_wall",
     "x": 1800,
     "y": 700,
     "w": 240,
     "h": 210
    },
    {
     "prop": "platform_cracked",
     "x": 2700,
     "y": 638,
     "w": 340,
     "h": 270
    },
    {
     "prop": "cover_ice_spike",
     "x": 3400,
     "y": 680,
     "w": 240,
     "h": 230
    }
   ]
  },
  "ashen_bridge": {
   "combined": "backgrounds/ashen_bridge/ashen_bridge_bg.png",
   "size": [
    3840,
    1080
   ],
   "tileable_x": true,
   "floor_y": 900,
   "layers": [
    {
     "id": "sky",
     "file": "backgrounds/ashen_bridge/ashen_bridge_sky.png",
     "parallax": 0.05
    },
    {
     "id": "far",
     "file": "backgrounds/ashen_bridge/ashen_bridge_far.png",
     "parallax": 0.15,
     "note": "mountains + ice wall, transparent sky"
    },
    {
     "id": "mid",
     "file": "backgrounds/ashen_bridge/ashen_bridge_mid_ruins.png",
     "parallax": 0.45
    },
    {
     "id": "fg",
     "file": "backgrounds/ashen_bridge/ashen_bridge_fg_battlements.png",
     "parallax": 1.0,
     "note": "walkable floor at floor_y"
    },
    {
     "id": "cover",
     "file": "backgrounds/ashen_bridge/ashen_bridge_cover.png",
     "parallax": 1.0,
     "optional": true
    }
   ],
   "props": {
    "bridge_tower": {
     "file": "backgrounds/ashen_bridge/props/bridge_tower.png",
     "size": [
      300,
      700
     ],
     "ground_y": 696
    },
    "platform_cracked": {
     "file": "backgrounds/ashen_bridge/props/platform_cracked.png",
     "size": [
      340,
      270
     ],
     "ground_y": 266,
     "slab": [
      8,
      58,
      326,
      44
     ]
    }
   },
   "cover_placements": [
    {
     "prop": "bridge_tower",
     "x": 300,
     "y": 208,
     "w": 300,
     "h": 700
    },
    {
     "prop": "platform_cracked",
     "x": 1900,
     "y": 638,
     "w": 340,
     "h": 270
    },
    {
     "prop": "bridge_tower",
     "x": 3500,
     "y": 208,
     "w": 300,
     "h": 700
    }
   ]
  },
  "wallbreaker": {
   "combined": "backgrounds/wallbreaker/wallbreaker_bg.png",
   "size": [
    3840,
    1080
   ],
   "tileable_x": true,
   "floor_y": 900,
   "layers": [
    {
     "id": "sky",
     "file": "backgrounds/wallbreaker/wallbreaker_sky.png",
     "parallax": 0.05
    },
    {
     "id": "far",
     "file": "backgrounds/wallbreaker/wallbreaker_far.png",
     "parallax": 0.15,
     "note": "mountains + ice wall, transparent sky"
    },
    {
     "id": "mid",
     "file": "backgrounds/wallbreaker/wallbreaker_mid_ruins.png",
     "parallax": 0.45
    },
    {
     "id": "fg",
     "file": "backgrounds/wallbreaker/wallbreaker_fg_battlements.png",
     "parallax": 1.0,
     "note": "walkable floor at floor_y"
    },
    {
     "id": "cover",
     "file": "backgrounds/wallbreaker/wallbreaker_cover.png",
     "parallax": 1.0,
     "optional": true
    }
   ],
   "props": {
    "ice_block": {
     "file": "backgrounds/wallbreaker/props/ice_block.png",
     "size": [
      240,
      220
     ],
     "ground_y": 216,
     "states": {
      "cracked": "backgrounds/wallbreaker/props/ice_block_cracked.png",
      "rubble": "backgrounds/wallbreaker/props/ice_block_rubble.png"
     }
    },
    "fractured_pillar": {
     "file": "backgrounds/wallbreaker/props/fractured_pillar.png",
     "size": [
      150,
      450
     ],
     "ground_y": 446,
     "states": {
      "cracked": "backgrounds/wallbreaker/props/fractured_pillar_cracked.png",
      "rubble": "backgrounds/wallbreaker/props/fractured_pillar_rubble.png"
     }
    },
    "boulder": {
     "file": "backgrounds/wallbreaker/props/boulder.png",
     "size": [
      260,
      170
     ],
     "ground_y": 166
    },
    "ice_formation": {
     "file": "backgrounds/wallbreaker/props/ice_formation.png",
     "size": [
      260,
      280
     ],
     "ground_y": 276,
     "states": {
      "cracked": "backgrounds/wallbreaker/props/ice_formation_cracked.png",
      "rubble": "backgrounds/wallbreaker/props/ice_formation_rubble.png"
     }
    },
    "rampart_step": {
     "file": "backgrounds/wallbreaker/props/rampart_step.png",
     "size": [
      320,
      250
     ],
     "ground_y": 246,
     "slab": [
      6,
      42,
      308,
      44
     ]
    },
    "rampart_high": {
     "file": "backgrounds/wallbreaker/props/rampart_high.png",
     "size": [
      340,
      446
     ],
     "ground_y": 442,
     "slab": [
      6,
      48,
      328,
      44
     ]
    },
    "portcullis": {
     "file": "backgrounds/wallbreaker/props/portcullis.png",
     "size": [
      300,
      640
     ],
     "ground_y": 636
    },
    "fortress_gate": {
     "file": "backgrounds/wallbreaker/props/fortress_gate.png",
     "size": [
      560,
      940
     ],
     "ground_y": 936
    },
    "fallen_scout": {
     "file": "backgrounds/wallbreaker/props/fallen_scout.png",
     "size": [
      260,
      90
     ],
     "ground_y": 88
    },
    "weapon_rack": {
     "file": "backgrounds/wallbreaker/props/weapon_rack.png",
     "size": [
      220,
      170
     ],
     "ground_y": 166
    },
    "gate_winch": {
     "file": "backgrounds/wallbreaker/props/gate_winch.png",
     "size": [
      280,
      240
     ],
     "ground_y": 236
    },
    "collapsed_pillar": {
     "file": "backgrounds/wallbreaker/props/collapsed_pillar.png",
     "size": [
      300,
      130
     ],
     "ground_y": 128
    },
    "brazier_post": {
     "file": "backgrounds/wallbreaker/props/brazier_post.png",
     "size": [
      120,
      260
     ],
     "ground_y": 256
    }
   },
   "cover_placements": [
    {
     "prop": "boulder",
     "x": 700,
     "y": 738,
     "w": 260,
     "h": 170
    },
    {
     "prop": "ice_block",
     "x": 1500,
     "y": 688,
     "w": 240,
     "h": 220
    },
    {
     "prop": "fractured_pillar",
     "x": 2300,
     "y": 458,
     "w": 150,
     "h": 450
    },
    {
     "prop": "boulder",
     "x": 3100,
     "y": 738,
     "w": 260,
     "h": 170
    }
   ]
  },
  "dragonpit": {
   "combined": "backgrounds/dragonpit/dragonpit_bg.png",
   "size": [
    3840,
    1080
   ],
   "tileable_x": true,
   "floor_y": 900,
   "layers": [
    {
     "id": "sky",
     "file": "backgrounds/dragonpit/dragonpit_sky.png",
     "parallax": 0.05
    },
    {
     "id": "far",
     "file": "backgrounds/dragonpit/dragonpit_far.png",
     "parallax": 0.15,
     "note": "mountains + ice wall, transparent sky"
    },
    {
     "id": "mid",
     "file": "backgrounds/dragonpit/dragonpit_mid_ruins.png",
     "parallax": 0.45
    },
    {
     "id": "fg",
     "file": "backgrounds/dragonpit/dragonpit_fg_battlements.png",
     "parallax": 1.0,
     "note": "walkable floor at floor_y"
    },
    {
     "id": "cover",
     "file": "backgrounds/dragonpit/dragonpit_cover.png",
     "parallax": 1.0,
     "optional": true
    }
   ],
   "props": {
    "pit_tier": {
     "file": "backgrounds/dragonpit/props/pit_tier.png",
     "size": [
      330,
      262
     ],
     "ground_y": 258,
     "slab": [
      6,
      50,
      318,
      46
     ]
    },
    "fallen_column": {
     "file": "backgrounds/dragonpit/props/fallen_column.png",
     "size": [
      150,
      450
     ],
     "ground_y": 446,
     "states": {
      "cracked": "backgrounds/dragonpit/props/fallen_column_cracked.png",
      "rubble": "backgrounds/dragonpit/props/fallen_column_rubble.png"
     }
    },
    "rubble_heap": {
     "file": "backgrounds/dragonpit/props/rubble_heap.png",
     "size": [
      260,
      140
     ],
     "ground_y": 136
    },
    "iron_collar": {
     "file": "backgrounds/dragonpit/props/iron_collar.png",
     "size": [
      320,
      150
     ],
     "ground_y": 146
    },
    "bone_pile": {
     "file": "backgrounds/dragonpit/props/bone_pile.png",
     "size": [
      380,
      170
     ],
     "ground_y": 168
    },
    "brazier_tall": {
     "file": "backgrounds/dragonpit/props/brazier_tall.png",
     "size": [
      120,
      260
     ],
     "ground_y": 256
    },
    "pit_gate": {
     "file": "backgrounds/dragonpit/props/pit_gate.png",
     "size": [
      300,
      640
     ],
     "ground_y": 636
    }
   },
   "cover_placements": [
    {
     "prop": "rubble_heap",
     "x": 900,
     "y": 768,
     "w": 260,
     "h": 140
    },
    {
     "prop": "bone_pile",
     "x": 2000,
     "y": 736,
     "w": 380,
     "h": 170
    },
    {
     "prop": "rubble_heap",
     "x": 3100,
     "y": 768,
     "w": 260,
     "h": 140
    }
   ]
  },
  "kingswall": {
   "ending_panorama": {
    "file": "backgrounds/kingswall/kingswall_ending.png",
    "size": [
     3840,
     2160
    ],
    "spot": [
     1920,
     838
    ],
    "note": "the warrior stands at spot (feet) for the closing pull-back"
   },
   "combined": "backgrounds/kingswall/kingswall_bg.png",
   "size": [
    3840,
    1080
   ],
   "tileable_x": true,
   "floor_y": 900,
   "layers": [
    {
     "id": "sky",
     "file": "backgrounds/kingswall/kingswall_sky.png",
     "parallax": 0.05
    },
    {
     "id": "far",
     "file": "backgrounds/kingswall/kingswall_far.png",
     "parallax": 0.15,
     "note": "mountains + ice wall, transparent sky"
    },
    {
     "id": "mid",
     "file": "backgrounds/kingswall/kingswall_mid_ruins.png",
     "parallax": 0.45
    },
    {
     "id": "fg",
     "file": "backgrounds/kingswall/kingswall_fg_battlements.png",
     "parallax": 1.0,
     "note": "walkable floor at floor_y"
    },
    {
     "id": "cover",
     "file": "backgrounds/kingswall/kingswall_cover.png",
     "parallax": 1.0,
     "optional": true
    }
   ],
   "props": {
    "ice_pillar": {
     "file": "backgrounds/kingswall/props/ice_pillar.png",
     "size": [
      170,
      430
     ],
     "ground_y": 426,
     "states": {
      "cracked": "backgrounds/kingswall/props/ice_pillar_cracked.png",
      "rubble": "backgrounds/kingswall/props/ice_pillar_rubble.png"
     }
    },
    "timber_barricade": {
     "file": "backgrounds/kingswall/props/timber_barricade.png",
     "size": [
      260,
      200
     ],
     "ground_y": 196,
     "states": {
      "cracked": "backgrounds/kingswall/props/timber_barricade_cracked.png",
      "rubble": "backgrounds/kingswall/props/timber_barricade_rubble.png"
     }
    },
    "frost_shrine": {
     "file": "backgrounds/kingswall/props/frost_shrine.png",
     "size": [
      300,
      360
     ],
     "ground_y": 356
    },
    "launcher_cradle": {
     "file": "backgrounds/kingswall/props/launcher_cradle.png",
     "size": [
      340,
      170
     ],
     "ground_y": 166
    },
    "war_brazier": {
     "file": "backgrounds/kingswall/props/war_brazier.png",
     "size": [
      160,
      230
     ],
     "ground_y": 226
    },
    "stark_standard": {
     "file": "backgrounds/kingswall/props/stark_standard.png",
     "size": [
      160,
      420
     ],
     "ground_y": 416
    },
    "ice_gate": {
     "file": "backgrounds/kingswall/props/ice_gate.png",
     "size": [
      300,
      640
     ],
     "ground_y": 636
    }
   },
   "cover_placements": [
    {
     "prop": "ice_pillar",
     "x": 900,
     "y": 478,
     "w": 170,
     "h": 430
    },
    {
     "prop": "timber_barricade",
     "x": 2100,
     "y": 708,
     "w": 260,
     "h": 200
    },
    {
     "prop": "ice_pillar",
     "x": 3200,
     "y": 478,
     "w": 170,
     "h": 430
    }
   ]
  }
 },
 "concept": {
  "keyart": "concept/keyart_frozen_wall.png",
  "panorama": "concept/frozen_wall_layers_composite.png",
  "weapon_lineup": "concept/weapon_lineup.png",
  "scale_reference": "concept/scale_reference.png"
 },
 "dragon_emberwing": {
  "base": "sprites/dragon_emberwing/dragon_emberwing_base.png",
  "frame_size": [
   768,
   512
  ],
  "facing": "left",
  "pivot": [
   384,
   486
  ],
  "recommended_scale_1080p": 1.05,
  "sheet_pattern": "sprites/dragon_emberwing/sheets/dragon_emberwing_{anim}.png",
  "frames_pattern": "sprites/dragon_emberwing/frames/{anim}/dragon_emberwing_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       693,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       695,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       692,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       688,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       687,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       690,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       223,
       696,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       218,
       698,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       300.6
      ],
      "fire_angle": 287.6,
      "head": [
       167.5,
       271.9
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       120,
       214,
       697,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       218,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       223,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       224,
       689,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.4,
       309.4
      ],
      "fire_angle": 287.6,
      "head": [
       159.0,
       280.7
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       111,
       223,
       691,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       224,
       693,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       180.4,
       238.7
      ],
      "fire_angle": 264.8,
      "head": [
       215.8,
       224.4
      ],
      "chest": [
       310.0,
       350.0
      ],
      "bbox": [
       163,
       64,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.2,
       209.3
      ],
      "fire_angle": 253.2,
      "head": [
       254.5,
       197.0
      ],
      "chest": [
       320.0,
       340.0
      ],
      "bbox": [
       203,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       116.9,
       403.8
      ],
      "fire_angle": 311.6,
      "head": [
       110.4,
       347.2
      ],
      "chest": [
       272.0,
       368.0
      ],
      "bbox": [
       68,
       126,
       683,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       81.3,
       404.1
      ],
      "fire_angle": 302.8,
      "head": [
       100.4,
       371.0
      ],
      "chest": [
       264.0,
       372.0
      ],
      "bbox": [
       59,
       150,
       675,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       97.8,
       375.9
      ],
      "fire_angle": 300.0,
      "head": [
       114.8,
       337.2
      ],
      "chest": [
       274.0,
       368.0
      ],
      "bbox": [
       71,
       104,
       678,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.7,
       317.5
      ],
      "fire_angle": 291.6,
      "head": [
       157.2,
       287.0
      ],
      "chest": [
       294.0,
       362.0
      ],
      "bbox": [
       111,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       237.9
      ],
      "fire_angle": 261.6,
      "head": [
       211.4,
       223.7
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       158,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       221.2,
       199.9
      ],
      "fire_angle": 246.0,
      "head": [
       262.5,
       191.0
      ],
      "chest": [
       318.0,
       340.0
      ],
      "bbox": [
       205,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.9,
       342.5
      ],
      "fire_angle": 292.4,
      "head": [
       133.8,
       293.2
      ],
      "chest": [
       282.0,
       360.0
      ],
      "bbox": [
       84,
       66,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       108.2,
       377.0
      ],
      "fire_angle": 298.8,
      "head": [
       115.4,
       321.8
      ],
      "chest": [
       274.0,
       364.0
      ],
      "bbox": [
       67,
       85,
       684,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       109.2,
       374.2
      ],
      "fire_angle": 297.7,
      "head": [
       116.6,
       317.9
      ],
      "chest": [
       274.0,
       364.9
      ],
      "bbox": [
       68,
       83,
       682,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.5,
       378.8
      ],
      "fire_angle": 299.5,
      "head": [
       114.7,
       324.4
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       679,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.6,
       378.6
      ],
      "fire_angle": 299.5,
      "head": [
       114.8,
       324.1
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       676,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       129.5,
       319.5
      ],
      "fire_angle": 291.2,
      "head": [
       153.0,
       285.7
      ],
      "chest": [
       290.0,
       362.0
      ],
      "bbox": [
       106,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       254.4,
       193.6
      ],
      "fire_angle": 230.4,
      "head": [
       305.4,
       184.5
      ],
      "chest": [
       322.0,
       344.0
      ],
      "bbox": [
       241,
       31,
       709,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       235.8,
       208.6
      ],
      "fire_angle": 241.2,
      "head": [
       281.2,
       196.6
      ],
      "chest": [
       328.0,
       350.0
      ],
      "bbox": [
       227,
       58,
       712,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.9,
       253.5
      ],
      "fire_angle": 267.2,
      "head": [
       219.1,
       232.1
      ],
      "chest": [
       316.0,
       356.0
      ],
      "bbox": [
       167,
       94,
       704,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.5,
       294.5
      ],
      "fire_angle": 285.6,
      "head": [
       179.0,
       266.7
      ],
      "chest": [
       302.0,
       360.0
      ],
      "bbox": [
       130,
       97,
       692,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       220.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       200.6
      ],
      "chest": [
       292.0,
       276.0
      ],
      "bbox": [
       91,
       0,
       697,
       383
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       698,
       386
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       27,
       698,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       175,
       696,
       451
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       240.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       220.6
      ],
      "chest": [
       292.0,
       296.0
      ],
      "bbox": [
       91,
       178,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       175,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       130,
       695,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       696,
       386
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       244.1,
       200.5
      ],
      "fire_angle": 235.2,
      "head": [
       295.0,
       185.6
      ],
      "chest": [
       318.0,
       344.0
      ],
      "bbox": [
       235,
       31,
       707,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       279.7,
       166.0
      ],
      "fire_angle": 223.6,
      "head": [
       335.9,
       157.5
      ],
      "chest": [
       332.0,
       318.0
      ],
      "bbox": [
       262,
       4,
       711,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.3,
       225.6
      ],
      "fire_angle": 249.6,
      "head": [
       256.0,
       201.9
      ],
      "chest": [
       324.0,
       350.0
      ],
      "bbox": [
       202,
       106,
       706,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.1,
       345.4
      ],
      "fire_angle": 276.4,
      "head": [
       162.6,
       311.3
      ],
      "chest": [
       308.0,
       392.0
      ],
      "bbox": [
       111,
       128,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       106.9,
       450.1
      ],
      "fire_angle": 284.0,
      "head": [
       134.0,
       417.6
      ],
      "chest": [
       300.0,
       428.0
      ],
      "bbox": [
       84,
       164,
       690,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.2,
       477.3
      ],
      "fire_angle": 278.4,
      "head": [
       128.8,
       451.3
      ],
      "chest": [
       296.0,
       448.0
      ],
      "bbox": [
       78,
       284,
       673,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.6,
       473.2
      ],
      "fire_angle": 269.6,
      "head": [
       126.7,
       454.1
      ],
      "chest": [
       294.0,
       452.0
      ],
      "bbox": [
       75,
       288,
       658,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       472.5
      ],
      "fire_angle": 267.2,
      "head": [
       127.0,
       455.8
      ],
      "chest": [
       294.0,
       454.0
      ],
      "bbox": [
       75,
       290,
       658,
       512
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       178.5,
       233.5
      ],
      "fire_angle": 258.4,
      "head": [
       216.1,
       219.6
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       162,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       91.4,
       387.4
      ],
      "fire_angle": 279.6,
      "head": [
       120.3,
       353.4
      ],
      "chest": [
       288.0,
       368.0
      ],
      "bbox": [
       68,
       104,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       88.9,
       468.2
      ],
      "fire_angle": 276.0,
      "head": [
       117.3,
       421.8
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       63,
       129,
       687,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       84.2,
       459.4
      ],
      "fire_angle": 273.8,
      "head": [
       114.0,
       412.5
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       59,
       129,
       685,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       90.2,
       470.4
      ],
      "fire_angle": 276.6,
      "head": [
       118.3,
       424.2
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       64,
       129,
       683,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.8,
       476.0
      ],
      "fire_angle": 278.0,
      "head": [
       121.0,
       430.3
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       67,
       129,
       680,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       115.2,
       328.5
      ],
      "fire_angle": 286.4,
      "head": [
       141.9,
       298.5
      ],
      "chest": [
       290.0,
       364.0
      ],
      "bbox": [
       93,
       101,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.5,
       362.2
      ],
      "fire_angle": 275.6,
      "head": [
       157.5,
       339.6
      ],
      "chest": [
       320.0,
       388.0
      ],
      "bbox": [
       106,
       271,
       706,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       374.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       346.5
      ],
      "chest": [
       268.0,
       376.0
      ],
      "bbox": [
       49,
       260,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "bbox": [
       49,
       255,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       362.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       334.5
      ],
      "chest": [
       268.0,
       364.0
      ],
      "bbox": [
       49,
       250,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "bbox": [
       49,
       255,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.4,
       333.7
      ],
      "fire_angle": 285.2,
      "head": [
       156.3,
       302.4
      ],
      "chest": [
       296.0,
       382.0
      ],
      "bbox": [
       107,
       232,
       702,
       498
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "ui": {
  "sigil": "ui/stark_sigil.png"
 },
 "dragon_meleys": {
  "base": "sprites/dragon_meleys/dragon_meleys_base.png",
  "frame_size": [
   768,
   512
  ],
  "facing": "left",
  "pivot": [
   384,
   486
  ],
  "recommended_scale_1080p": 1.3,
  "sheet_pattern": "sprites/dragon_meleys/sheets/dragon_meleys_{anim}.png",
  "frames_pattern": "sprites/dragon_meleys/frames/{anim}/dragon_meleys_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       693,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       695,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       692,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       688,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       687,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       690,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       206,
       696,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       200,
       698,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       300.6
      ],
      "fire_angle": 287.6,
      "head": [
       167.5,
       271.9
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       120,
       197,
       697,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       200,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       206,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       207,
       689,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.4,
       309.4
      ],
      "fire_angle": 287.6,
      "head": [
       159.0,
       280.7
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       111,
       206,
       691,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       207,
       693,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       180.4,
       238.7
      ],
      "fire_angle": 264.8,
      "head": [
       215.8,
       224.4
      ],
      "chest": [
       310.0,
       350.0
      ],
      "bbox": [
       163,
       64,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.2,
       209.3
      ],
      "fire_angle": 253.2,
      "head": [
       254.5,
       197.0
      ],
      "chest": [
       320.0,
       340.0
      ],
      "bbox": [
       203,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       116.9,
       403.8
      ],
      "fire_angle": 311.6,
      "head": [
       110.4,
       347.2
      ],
      "chest": [
       272.0,
       368.0
      ],
      "bbox": [
       68,
       126,
       683,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       81.3,
       404.1
      ],
      "fire_angle": 302.8,
      "head": [
       100.4,
       371.0
      ],
      "chest": [
       264.0,
       372.0
      ],
      "bbox": [
       59,
       150,
       675,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       97.8,
       375.9
      ],
      "fire_angle": 300.0,
      "head": [
       114.8,
       337.2
      ],
      "chest": [
       274.0,
       368.0
      ],
      "bbox": [
       71,
       104,
       678,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.7,
       317.5
      ],
      "fire_angle": 291.6,
      "head": [
       157.2,
       287.0
      ],
      "chest": [
       294.0,
       362.0
      ],
      "bbox": [
       111,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       237.9
      ],
      "fire_angle": 261.6,
      "head": [
       211.4,
       223.7
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       158,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       221.2,
       199.9
      ],
      "fire_angle": 246.0,
      "head": [
       262.5,
       191.0
      ],
      "chest": [
       318.0,
       340.0
      ],
      "bbox": [
       205,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.9,
       342.5
      ],
      "fire_angle": 292.4,
      "head": [
       133.8,
       293.2
      ],
      "chest": [
       282.0,
       360.0
      ],
      "bbox": [
       84,
       66,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       108.2,
       377.0
      ],
      "fire_angle": 298.8,
      "head": [
       115.4,
       321.8
      ],
      "chest": [
       274.0,
       364.0
      ],
      "bbox": [
       67,
       85,
       684,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       109.2,
       374.2
      ],
      "fire_angle": 297.7,
      "head": [
       116.6,
       317.9
      ],
      "chest": [
       274.0,
       364.9
      ],
      "bbox": [
       68,
       83,
       682,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.5,
       378.8
      ],
      "fire_angle": 299.5,
      "head": [
       114.7,
       324.4
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       679,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.6,
       378.6
      ],
      "fire_angle": 299.5,
      "head": [
       114.8,
       324.1
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       676,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       129.5,
       319.5
      ],
      "fire_angle": 291.2,
      "head": [
       153.0,
       285.7
      ],
      "chest": [
       290.0,
       362.0
      ],
      "bbox": [
       106,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       254.4,
       193.6
      ],
      "fire_angle": 230.4,
      "head": [
       305.4,
       184.5
      ],
      "chest": [
       322.0,
       344.0
      ],
      "bbox": [
       241,
       31,
       709,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       235.8,
       208.6
      ],
      "fire_angle": 241.2,
      "head": [
       281.2,
       196.6
      ],
      "chest": [
       328.0,
       350.0
      ],
      "bbox": [
       227,
       58,
       712,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.9,
       253.5
      ],
      "fire_angle": 267.2,
      "head": [
       219.1,
       232.1
      ],
      "chest": [
       316.0,
       356.0
      ],
      "bbox": [
       167,
       94,
       704,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.5,
       294.5
      ],
      "fire_angle": 285.6,
      "head": [
       179.0,
       266.7
      ],
      "chest": [
       302.0,
       360.0
      ],
      "bbox": [
       130,
       97,
       692,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       220.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       200.6
      ],
      "chest": [
       292.0,
       276.0
      ],
      "bbox": [
       91,
       0,
       697,
       383
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       698,
       386
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       27,
       698,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       163,
       696,
       451
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       240.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       220.6
      ],
      "chest": [
       292.0,
       296.0
      ],
      "bbox": [
       91,
       166,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       163,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       130,
       695,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       696,
       386
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       244.1,
       200.5
      ],
      "fire_angle": 235.2,
      "head": [
       295.0,
       185.6
      ],
      "chest": [
       318.0,
       344.0
      ],
      "bbox": [
       235,
       31,
       707,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       279.7,
       166.0
      ],
      "fire_angle": 223.6,
      "head": [
       335.9,
       157.5
      ],
      "chest": [
       332.0,
       318.0
      ],
      "bbox": [
       262,
       4,
       711,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.3,
       225.6
      ],
      "fire_angle": 249.6,
      "head": [
       256.0,
       201.9
      ],
      "chest": [
       324.0,
       350.0
      ],
      "bbox": [
       202,
       106,
       706,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.1,
       345.4
      ],
      "fire_angle": 276.4,
      "head": [
       162.6,
       311.3
      ],
      "chest": [
       308.0,
       392.0
      ],
      "bbox": [
       111,
       128,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       106.9,
       450.1
      ],
      "fire_angle": 284.0,
      "head": [
       134.0,
       417.6
      ],
      "chest": [
       300.0,
       428.0
      ],
      "bbox": [
       84,
       164,
       690,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.2,
       477.3
      ],
      "fire_angle": 278.4,
      "head": [
       128.8,
       451.3
      ],
      "chest": [
       296.0,
       448.0
      ],
      "bbox": [
       78,
       284,
       673,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.6,
       473.2
      ],
      "fire_angle": 269.6,
      "head": [
       126.7,
       454.1
      ],
      "chest": [
       294.0,
       452.0
      ],
      "bbox": [
       75,
       288,
       658,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       472.5
      ],
      "fire_angle": 267.2,
      "head": [
       127.0,
       455.8
      ],
      "chest": [
       294.0,
       454.0
      ],
      "bbox": [
       75,
       290,
       658,
       512
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       178.5,
       233.5
      ],
      "fire_angle": 258.4,
      "head": [
       216.1,
       219.6
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       162,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       91.4,
       387.4
      ],
      "fire_angle": 279.6,
      "head": [
       120.3,
       353.4
      ],
      "chest": [
       288.0,
       368.0
      ],
      "bbox": [
       68,
       104,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       88.9,
       468.2
      ],
      "fire_angle": 276.0,
      "head": [
       117.3,
       421.8
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       63,
       129,
       687,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       84.2,
       459.4
      ],
      "fire_angle": 273.8,
      "head": [
       114.0,
       412.5
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       59,
       129,
       685,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       90.2,
       470.4
      ],
      "fire_angle": 276.6,
      "head": [
       118.3,
       424.2
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       64,
       129,
       683,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.8,
       476.0
      ],
      "fire_angle": 278.0,
      "head": [
       121.0,
       430.3
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       67,
       129,
       680,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       115.2,
       328.5
      ],
      "fire_angle": 286.4,
      "head": [
       141.9,
       298.5
      ],
      "chest": [
       290.0,
       364.0
      ],
      "bbox": [
       93,
       101,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.5,
       362.2
      ],
      "fire_angle": 275.6,
      "head": [
       157.5,
       339.6
      ],
      "chest": [
       320.0,
       388.0
      ],
      "bbox": [
       106,
       271,
       706,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       374.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       346.5
      ],
      "chest": [
       268.0,
       376.0
      ],
      "bbox": [
       49,
       260,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "bbox": [
       49,
       255,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       362.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       334.5
      ],
      "chest": [
       268.0,
       364.0
      ],
      "bbox": [
       49,
       250,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "bbox": [
       49,
       255,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.4,
       333.7
      ],
      "fire_angle": 285.2,
      "head": [
       156.3,
       302.4
      ],
      "chest": [
       296.0,
       382.0
      ],
      "bbox": [
       107,
       232,
       702,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "slam": {
    "frames": 6,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       198.7,
       204.4
      ],
      "fire_angle": 254.0,
      "head": [
       238.5,
       189.8
      ],
      "chest": [
       316.0,
       330.0
      ],
      "bbox": [
       187,
       14,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       258.4,
       150.9
      ],
      "fire_angle": 238.4,
      "head": [
       307.7,
       134.7
      ],
      "chest": [
       338.0,
       292.0
      ],
      "bbox": [
       231,
       0,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.8,
       284.8
      ],
      "fire_angle": 272.0,
      "head": [
       166.5,
       249.5
      ],
      "chest": [
       298.0,
       350.0
      ],
      "bbox": [
       114,
       88,
       698,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       86.7,
       421.5
      ],
      "fire_angle": 292.0,
      "head": [
       101.3,
       369.2
      ],
      "chest": [
       268.0,
       392.0
      ],
      "bbox": [
       51,
       226,
       687,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       76.6,
       403.6
      ],
      "fire_angle": 282.8,
      "head": [
       103.9,
       369.9
      ],
      "chest": [
       272.0,
       388.0
      ],
      "bbox": [
       54,
       154,
       686,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.2,
       328.5
      ],
      "fire_angle": 286.4,
      "head": [
       143.9,
       298.5
      ],
      "chest": [
       292.0,
       364.0
      ],
      "bbox": [
       95,
       101,
       691,
       498
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "objects": {
  "scorpion": {
   "base": "objects/scorpion/scorpion_base.png",
   "arm_loaded": "objects/scorpion/scorpion_arm_loaded.png",
   "arm_empty": "objects/scorpion/scorpion_arm_empty.png",
   "bolt": "objects/scorpion/scorpion_bolt.png",
   "mount": [
    160,
    68
   ],
   "pivot": [
    130,
    160
   ],
   "muzzle": [
    210,
    0
   ],
   "bolt_nock": [
    10,
    20
   ],
   "note": "arm rotates about pivot, placed on the base mount; parts face right"
  },
  "frostpiercer": {
   "deploy_0": "objects/frostpiercer/frostpiercer_deploy_0.png",
   "deploy_1": "objects/frostpiercer/frostpiercer_deploy_1.png",
   "deploy_2": "objects/frostpiercer/frostpiercer_deploy_2.png",
   "deploy_3": "objects/frostpiercer/frostpiercer_deploy_3.png",
   "deploy_4": "objects/frostpiercer/frostpiercer_deploy_4.png",
   "empty": "objects/frostpiercer/frostpiercer_empty.png",
   "spear": "objects/frostpiercer/frostpiercer_spear.png",
   "icon": "objects/frostpiercer/frostpiercer_icon.png",
   "px_per_unit": 2,
   "grip": [
    212,
    184
   ],
   "muzzle": [
    552,
    136
   ],
   "core": [
    80,
    138
   ],
   "rings": [
    [
     189.76,
     136
    ],
    [
     308.48,
     136
    ],
    [
     427.20000000000005,
     136
    ]
   ],
   "rail": [
    136
   ],
   "spear_tip": [
    452,
    40
   ],
   "deploy_frames": 5
  }
 },
 "dragon_rhagal": {
  "base": "sprites/dragon_rhagal/dragon_rhagal_base.png",
  "frame_size": [
   768,
   512
  ],
  "facing": "left",
  "pivot": [
   384,
   486
  ],
  "recommended_scale_1080p": 1.1,
  "sheet_pattern": "sprites/dragon_rhagal/sheets/dragon_rhagal_{anim}.png",
  "frames_pattern": "sprites/dragon_rhagal/frames/{anim}/dragon_rhagal_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       693,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       695,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "bbox": [
       131,
       74,
       692,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "bbox": [
       125,
       77,
       688,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       687,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "bbox": [
       120,
       80,
       690,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       217,
       696,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       211,
       698,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       300.6
      ],
      "fire_angle": 287.6,
      "head": [
       167.5,
       271.9
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       120,
       208,
       697,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       118,
       211,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "bbox": [
       115,
       217,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       218,
       689,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.4,
       309.4
      ],
      "fire_angle": 287.6,
      "head": [
       159.0,
       280.7
      ],
      "chest": [
       296.0,
       359.5
      ],
      "bbox": [
       111,
       217,
       691,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "bbox": [
       112,
       218,
       693,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       180.4,
       238.7
      ],
      "fire_angle": 264.8,
      "head": [
       215.8,
       224.4
      ],
      "chest": [
       310.0,
       350.0
      ],
      "bbox": [
       163,
       64,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.2,
       209.3
      ],
      "fire_angle": 253.2,
      "head": [
       254.5,
       197.0
      ],
      "chest": [
       320.0,
       340.0
      ],
      "bbox": [
       203,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       116.9,
       403.8
      ],
      "fire_angle": 311.6,
      "head": [
       110.4,
       347.2
      ],
      "chest": [
       272.0,
       368.0
      ],
      "bbox": [
       68,
       126,
       683,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       81.3,
       404.1
      ],
      "fire_angle": 302.8,
      "head": [
       100.4,
       371.0
      ],
      "chest": [
       264.0,
       372.0
      ],
      "bbox": [
       59,
       150,
       675,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       97.8,
       375.9
      ],
      "fire_angle": 300.0,
      "head": [
       114.8,
       337.2
      ],
      "chest": [
       274.0,
       368.0
      ],
      "bbox": [
       71,
       104,
       678,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.7,
       317.5
      ],
      "fire_angle": 291.6,
      "head": [
       157.2,
       287.0
      ],
      "chest": [
       294.0,
       362.0
      ],
      "bbox": [
       111,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       237.9
      ],
      "fire_angle": 261.6,
      "head": [
       211.4,
       223.7
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       158,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       221.2,
       199.9
      ],
      "fire_angle": 246.0,
      "head": [
       262.5,
       191.0
      ],
      "chest": [
       318.0,
       340.0
      ],
      "bbox": [
       205,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.9,
       342.5
      ],
      "fire_angle": 292.4,
      "head": [
       133.8,
       293.2
      ],
      "chest": [
       282.0,
       360.0
      ],
      "bbox": [
       84,
       66,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       108.2,
       377.0
      ],
      "fire_angle": 298.8,
      "head": [
       115.4,
       321.8
      ],
      "chest": [
       274.0,
       364.0
      ],
      "bbox": [
       67,
       85,
       684,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       109.2,
       374.2
      ],
      "fire_angle": 297.7,
      "head": [
       116.6,
       317.9
      ],
      "chest": [
       274.0,
       364.9
      ],
      "bbox": [
       68,
       83,
       682,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.5,
       378.8
      ],
      "fire_angle": 299.5,
      "head": [
       114.7,
       324.4
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       679,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.6,
       378.6
      ],
      "fire_angle": 299.5,
      "head": [
       114.8,
       324.1
      ],
      "chest": [
       274.0,
       363.4
      ],
      "bbox": [
       67,
       86,
       676,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       129.5,
       319.5
      ],
      "fire_angle": 291.2,
      "head": [
       153.0,
       285.7
      ],
      "chest": [
       290.0,
       362.0
      ],
      "bbox": [
       106,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       254.4,
       193.6
      ],
      "fire_angle": 230.4,
      "head": [
       305.4,
       184.5
      ],
      "chest": [
       322.0,
       344.0
      ],
      "bbox": [
       241,
       31,
       709,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       235.8,
       208.6
      ],
      "fire_angle": 241.2,
      "head": [
       281.2,
       196.6
      ],
      "chest": [
       328.0,
       350.0
      ],
      "bbox": [
       227,
       58,
       712,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.9,
       253.5
      ],
      "fire_angle": 267.2,
      "head": [
       219.1,
       232.1
      ],
      "chest": [
       316.0,
       356.0
      ],
      "bbox": [
       167,
       94,
       704,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.5,
       294.5
      ],
      "fire_angle": 285.6,
      "head": [
       179.0,
       266.7
      ],
      "chest": [
       302.0,
       360.0
      ],
      "bbox": [
       130,
       97,
       692,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       220.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       200.6
      ],
      "chest": [
       292.0,
       276.0
      ],
      "bbox": [
       91,
       0,
       697,
       383
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       698,
       386
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       27,
       698,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       171,
       696,
       451
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       240.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       220.6
      ],
      "chest": [
       292.0,
       296.0
      ],
      "bbox": [
       91,
       174,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "bbox": [
       91,
       171,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "bbox": [
       91,
       130,
       695,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "bbox": [
       91,
       0,
       696,
       386
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       244.1,
       200.5
      ],
      "fire_angle": 235.2,
      "head": [
       295.0,
       185.6
      ],
      "chest": [
       318.0,
       344.0
      ],
      "bbox": [
       235,
       31,
       707,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       279.7,
       166.0
      ],
      "fire_angle": 223.6,
      "head": [
       335.9,
       157.5
      ],
      "chest": [
       332.0,
       318.0
      ],
      "bbox": [
       262,
       4,
       711,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.3,
       225.6
      ],
      "fire_angle": 249.6,
      "head": [
       256.0,
       201.9
      ],
      "chest": [
       324.0,
       350.0
      ],
      "bbox": [
       202,
       106,
       706,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.1,
       345.4
      ],
      "fire_angle": 276.4,
      "head": [
       162.6,
       311.3
      ],
      "chest": [
       308.0,
       392.0
      ],
      "bbox": [
       111,
       128,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       106.9,
       450.1
      ],
      "fire_angle": 284.0,
      "head": [
       134.0,
       417.6
      ],
      "chest": [
       300.0,
       428.0
      ],
      "bbox": [
       84,
       164,
       690,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.2,
       477.3
      ],
      "fire_angle": 278.4,
      "head": [
       128.8,
       451.3
      ],
      "chest": [
       296.0,
       448.0
      ],
      "bbox": [
       78,
       284,
       673,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.6,
       473.2
      ],
      "fire_angle": 269.6,
      "head": [
       126.7,
       454.1
      ],
      "chest": [
       294.0,
       452.0
      ],
      "bbox": [
       75,
       288,
       658,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       472.5
      ],
      "fire_angle": 267.2,
      "head": [
       127.0,
       455.8
      ],
      "chest": [
       294.0,
       454.0
      ],
      "bbox": [
       75,
       290,
       658,
       512
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       178.5,
       233.5
      ],
      "fire_angle": 258.4,
      "head": [
       216.1,
       219.6
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       162,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       91.4,
       387.4
      ],
      "fire_angle": 279.6,
      "head": [
       120.3,
       353.4
      ],
      "chest": [
       288.0,
       368.0
      ],
      "bbox": [
       68,
       104,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       88.9,
       468.2
      ],
      "fire_angle": 276.0,
      "head": [
       117.3,
       421.8
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       63,
       129,
       687,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       84.2,
       459.4
      ],
      "fire_angle": 273.8,
      "head": [
       114.0,
       412.5
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       59,
       129,
       685,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       90.2,
       470.4
      ],
      "fire_angle": 276.6,
      "head": [
       118.3,
       424.2
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       64,
       129,
       683,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.8,
       476.0
      ],
      "fire_angle": 278.0,
      "head": [
       121.0,
       430.3
      ],
      "chest": [
       270.0,
       380.0
      ],
      "bbox": [
       67,
       129,
       680,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       115.2,
       328.5
      ],
      "fire_angle": 286.4,
      "head": [
       141.9,
       298.5
      ],
      "chest": [
       290.0,
       364.0
      ],
      "bbox": [
       93,
       101,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.5,
       362.2
      ],
      "fire_angle": 275.6,
      "head": [
       157.5,
       339.6
      ],
      "chest": [
       320.0,
       388.0
      ],
      "bbox": [
       106,
       271,
       706,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       374.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       346.5
      ],
      "chest": [
       268.0,
       376.0
      ],
      "bbox": [
       49,
       260,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "bbox": [
       49,
       255,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       362.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       334.5
      ],
      "chest": [
       268.0,
       364.0
      ],
      "bbox": [
       49,
       250,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "bbox": [
       49,
       255,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.4,
       333.7
      ],
      "fire_angle": 285.2,
      "head": [
       156.3,
       302.4
      ],
      "chest": [
       296.0,
       382.0
      ],
      "bbox": [
       107,
       232,
       702,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "breath_level": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       232.8
      ],
      "fire_angle": 257.6,
      "head": [
       212.3,
       221.2
      ],
      "chest": [
       306.0,
       352.0
      ],
      "bbox": [
       159,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.6,
       207.9
      ],
      "fire_angle": 248.0,
      "head": [
       252.6,
       197.5
      ],
      "chest": [
       316.0,
       344.0
      ],
      "bbox": [
       195,
       25,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.8,
       339.0
      ],
      "fire_angle": 277.6,
      "head": [
       127.2,
       297.1
      ],
      "chest": [
       284.0,
       362.0
      ],
      "bbox": [
       74,
       68,
       692,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       89.6,
       358.7
      ],
      "fire_angle": 280.0,
      "head": [
       114.8,
       310.5
      ],
      "chest": [
       276.0,
       366.0
      ],
      "bbox": [
       61,
       83,
       684,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       91.5,
       356.9
      ],
      "fire_angle": 279.8,
      "head": [
       116.3,
       307.1
      ],
      "chest": [
       276.0,
       366.9
      ],
      "bbox": [
       62,
       84,
       682,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.5,
       360.0
      ],
      "fire_angle": 280.1,
      "head": [
       113.9,
       312.7
      ],
      "chest": [
       276.0,
       365.4
      ],
      "bbox": [
       60,
       83,
       679,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.6,
       359.8
      ],
      "fire_angle": 280.1,
      "head": [
       114.0,
       312.5
      ],
      "chest": [
       276.0,
       365.4
      ],
      "bbox": [
       60,
       83,
       676,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       130.1,
       317.4
      ],
      "fire_angle": 289.2,
      "head": [
       154.7,
       284.3
      ],
      "chest": [
       292.0,
       362.0
      ],
      "bbox": [
       107,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "aemond": {
  "sheet": "sprites/aemond/aemond.png",
  "frame_size": [
   336,
   272
  ],
  "pivot": [
   152,
   252
  ],
  "frames": 4,
  "facing": "right",
  "note": "0 thrown, 1 landed, 2 kneeling (blade dropped), 3 head raised"
 },
 "dragon_vhagar": {
  "base": "sprites/dragon_vhagar/dragon_vhagar_base.png",
  "frame_size": [
   960,
   640
  ],
  "res": 1.25,
  "facing": "left",
  "pivot": [
   480.0,
   607.5
  ],
  "recommended_scale_1080p": 1.5,
  "sheet_pattern": "sprites/dragon_vhagar/sheets/dragon_vhagar_{anim}.png",
  "frames_pattern": "sprites/dragon_vhagar/frames/{anim}/dragon_vhagar_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       171.7,
       382.0
      ],
      "fire_angle": 289.2,
      "head": [
       208.7,
       341.4
      ],
      "chest": [
       372.5,
       450.0
      ],
      "foreleg": [
       372.9,
       515.2
      ],
      "wing": [
       368.2,
       380.0
      ],
      "tail": [
       646.3,
       471.0
      ],
      "rider": [
       370.9,
       340.1
      ],
      "bbox": [
       143,
       97,
       866,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       180.4,
       387.2
      ],
      "fire_angle": 292.5,
      "head": [
       214.3,
       342.3
      ],
      "chest": [
       372.5,
       452.7
      ],
      "foreleg": [
       374.9,
       517.6
      ],
      "wing": [
       368.7,
       381.9
      ],
      "tail": [
       645.7,
       476.0
      ],
      "rider": [
       370.1,
       342.9
      ],
      "bbox": [
       150,
       93,
       868,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       180.4,
       387.2
      ],
      "fire_angle": 292.5,
      "head": [
       214.3,
       342.3
      ],
      "chest": [
       372.5,
       452.7
      ],
      "foreleg": [
       374.9,
       517.6
      ],
      "wing": [
       368.7,
       381.9
      ],
      "tail": [
       646.2,
       474.0
      ],
      "rider": [
       370.1,
       342.9
      ],
      "bbox": [
       150,
       93,
       864,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       171.7,
       382.0
      ],
      "fire_angle": 289.2,
      "head": [
       208.7,
       341.4
      ],
      "chest": [
       372.5,
       450.0
      ],
      "foreleg": [
       372.9,
       515.2
      ],
      "wing": [
       368.2,
       380.0
      ],
      "tail": [
       647.0,
       466.9
      ],
      "rider": [
       370.9,
       340.1
      ],
      "bbox": [
       143,
       97,
       859,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.6,
       379.6
      ],
      "fire_angle": 286.6,
      "head": [
       203.5,
       340.6
      ],
      "chest": [
       372.5,
       447.3
      ],
      "foreleg": [
       370.5,
       512.8
      ],
      "wing": [
       367.8,
       378.1
      ],
      "tail": [
       647.3,
       462.0
      ],
      "rider": [
       371.7,
       337.4
      ],
      "bbox": [
       136,
       101,
       858,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.6,
       379.6
      ],
      "fire_angle": 286.6,
      "head": [
       203.5,
       340.6
      ],
      "chest": [
       372.5,
       447.3
      ],
      "foreleg": [
       370.5,
       512.8
      ],
      "wing": [
       367.8,
       378.1
      ],
      "tail": [
       647.1,
       464.0
      ],
      "rider": [
       371.7,
       337.4
      ],
      "bbox": [
       136,
       101,
       861,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       159.3,
       393.4
      ],
      "fire_angle": 287.6,
      "head": [
       197.1,
       352.4
      ],
      "chest": [
       370.0,
       455.6
      ],
      "foreleg": [
       364.1,
       521.6
      ],
      "wing": [
       407.8,
       377.2
      ],
      "tail": [
       646.7,
       468.3
      ],
      "rider": [
       365.1,
       345.9
      ],
      "bbox": [
       130,
       235,
       870,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       163.2,
       386.4
      ],
      "fire_angle": 287.6,
      "head": [
       201.0,
       345.5
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       365.7,
       518.2
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       646.2,
       474.6
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       134,
       228,
       872,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.8,
       381.7
      ],
      "fire_angle": 287.6,
      "head": [
       202.6,
       340.8
      ],
      "chest": [
       370.0,
       449.4
      ],
      "foreleg": [
       366.4,
       514.8
      ],
      "wing": [
       410.0,
       372.4
      ],
      "tail": [
       646.2,
       477.3
      ],
      "rider": [
       371.6,
       339.5
      ],
      "bbox": [
       136,
       224,
       871,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       163.2,
       386.4
      ],
      "fire_angle": 287.6,
      "head": [
       201.0,
       345.5
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       373.2,
       517.1
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       646.8,
       471.2
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       134,
       228,
       867,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.3,
       393.4
      ],
      "fire_angle": 287.6,
      "head": [
       197.1,
       352.4
      ],
      "chest": [
       370.0,
       455.6
      ],
      "foreleg": [
       378.8,
       518.9
      ],
      "wing": [
       407.8,
       377.2
      ],
      "tail": [
       647.3,
       463.3
      ],
      "rider": [
       365.1,
       345.9
      ],
      "bbox": [
       130,
       235,
       862,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.7,
       394.2
      ],
      "fire_angle": 287.6,
      "head": [
       193.5,
       353.3
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       379.3,
       515.1
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       647.5,
       461.9
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       127,
       236,
       861,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       154.2,
       392.7
      ],
      "fire_angle": 287.6,
      "head": [
       192.0,
       351.8
      ],
      "chest": [
       370.0,
       449.4
      ],
      "foreleg": [
       384.5,
       508.5
      ],
      "wing": [
       410.0,
       372.4
      ],
      "tail": [
       647.5,
       464.3
      ],
      "rider": [
       371.6,
       339.5
      ],
      "bbox": [
       125,
       235,
       863,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.7,
       394.2
      ],
      "fire_angle": 287.6,
      "head": [
       193.5,
       353.3
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       377.9,
       515.7
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       647.2,
       465.4
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       127,
       236,
       866,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       212.8,
       299.3
      ],
      "fire_angle": 264.8,
      "head": [
       263.1,
       278.9
      ],
      "chest": [
       387.5,
       437.5
      ],
      "foreleg": [
       370.1,
       501.6
      ],
      "wing": [
       388.1,
       368.3
      ],
      "tail": [
       649.4,
       469.3
      ],
      "rider": [
       395.5,
       327.9
      ],
      "bbox": [
       190,
       80,
       876,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       256.2,
       260.6
      ],
      "fire_angle": 253.2,
      "head": [
       312.1,
       243.1
      ],
      "chest": [
       400.0,
       425.0
      ],
      "foreleg": [
       380.8,
       488.4
      ],
      "wing": [
       407.9,
       355.1
      ],
      "tail": [
       652.0,
       468.9
      ],
      "rider": [
       416.9,
       316.4
      ],
      "bbox": [
       240,
       28,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       516.8
      ],
      "fire_angle": 311.6,
      "head": [
       131.6,
       436.4
      ],
      "chest": [
       340.0,
       460.0
      ],
      "foreleg": [
       330.6,
       525.7
      ],
      "wing": [
       353.1,
       379.8
      ],
      "tail": [
       632.1,
       482.0
      ],
      "rider": [
       334.0,
       350.3
      ],
      "bbox": [
       72,
       159,
       853,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       513.6
      ],
      "fire_angle": 302.8,
      "head": [
       119.3,
       466.5
      ],
      "chest": [
       330.0,
       465.0
      ],
      "foreleg": [
       326.7,
       531.1
      ],
      "wing": [
       353.4,
       383.3
      ],
      "tail": [
       627.1,
       482.4
      ],
      "rider": [
       321.4,
       355.5
      ],
      "bbox": [
       62,
       188,
       843,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       112.8,
       478.7
      ],
      "fire_angle": 300.0,
      "head": [
       137.1,
       423.6
      ],
      "chest": [
       342.5,
       460.0
      ],
      "foreleg": [
       341.7,
       525.8
      ],
      "wing": [
       335.7,
       390.0
      ],
      "tail": [
       633.7,
       474.9
      ],
      "rider": [
       336.5,
       350.3
      ],
      "bbox": [
       76,
       131,
       847,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.0,
       403.7
      ],
      "fire_angle": 291.6,
      "head": [
       189.9,
       360.2
      ],
      "chest": [
       367.5,
       452.5
      ],
      "foreleg": [
       371.8,
       517.0
      ],
      "wing": [
       361.9,
       383.2
      ],
      "tail": [
       644.6,
       467.4
      ],
      "rider": [
       365.1,
       342.7
      ],
      "bbox": [
       125,
       124,
       856,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       205.8,
       297.8
      ],
      "fire_angle": 261.6,
      "head": [
       257.7,
       277.6
      ],
      "chest": [
       382.5,
       440.0
      ],
      "foreleg": [
       366.6,
       504.5
      ],
      "wing": [
       383.3,
       369.8
      ],
      "tail": [
       649.4,
       468.8
      ],
      "rider": [
       388.7,
       330.3
      ],
      "bbox": [
       184,
       75,
       876,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       263.8,
       247.5
      ],
      "fire_angle": 246.0,
      "head": [
       322.6,
       234.8
      ],
      "chest": [
       397.5,
       425.0
      ],
      "foreleg": [
       377.0,
       488.1
      ],
      "wing": [
       405.3,
       355.0
      ],
      "tail": [
       652.0,
       468.6
      ],
      "rider": [
       414.1,
       316.4
      ],
      "bbox": [
       243,
       28,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       137.8,
       437.2
      ],
      "fire_angle": 292.4,
      "head": [
       160.4,
       367.0
      ],
      "chest": [
       352.5,
       450.0
      ],
      "foreleg": [
       359.8,
       513.2
      ],
      "wing": [
       351.1,
       378.3
      ],
      "tail": [
       638.0,
       478.2
      ],
      "rider": [
       352.0,
       340.1
      ],
      "bbox": [
       92,
       83,
       861,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.2,
       481.8
      ],
      "fire_angle": 298.8,
      "head": [
       137.5,
       403.3
      ],
      "chest": [
       342.5,
       455.0
      ],
      "foreleg": [
       356.0,
       515.7
      ],
      "wing": [
       338.4,
       384.1
      ],
      "tail": [
       635.1,
       480.1
      ],
      "rider": [
       339.1,
       345.2
      ],
      "bbox": [
       71,
       107,
       854,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       128.5,
       478.3
      ],
      "fire_angle": 297.7,
      "head": [
       139.0,
       398.1
      ],
      "chest": [
       342.5,
       456.2
      ],
      "foreleg": [
       356.8,
       516.6
      ],
      "wing": [
       338.5,
       384.8
      ],
      "tail": [
       635.8,
       476.9
      ],
      "rider": [
       338.5,
       346.4
      ],
      "bbox": [
       71,
       104,
       852,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       126.4,
       484.0
      ],
      "fire_angle": 299.5,
      "head": [
       136.6,
       406.6
      ],
      "chest": [
       342.5,
       454.2
      ],
      "foreleg": [
       355.5,
       515.2
      ],
      "wing": [
       338.3,
       383.6
      ],
      "tail": [
       636.5,
       472.9
      ],
      "rider": [
       339.5,
       344.4
      ],
      "bbox": [
       70,
       108,
       848,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       126.5,
       483.8
      ],
      "fire_angle": 299.5,
      "head": [
       136.7,
       406.3
      ],
      "chest": [
       342.5,
       454.3
      ],
      "foreleg": [
       355.6,
       515.2
      ],
      "wing": [
       338.3,
       383.6
      ],
      "tail": [
       637.0,
       469.3
      ],
      "rider": [
       339.5,
       344.5
      ],
      "bbox": [
       70,
       108,
       845,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       151.1,
       406.5
      ],
      "fire_angle": 291.2,
      "head": [
       184.5,
       358.3
      ],
      "chest": [
       362.5,
       452.5
      ],
      "foreleg": [
       368.6,
       516.4
      ],
      "wing": [
       356.9,
       383.2
      ],
      "tail": [
       644.8,
       464.4
      ],
      "rider": [
       360.0,
       342.7
      ],
      "bbox": [
       119,
       124,
       856,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       305.5,
       237.9
      ],
      "fire_angle": 230.4,
      "head": [
       378.1,
       224.9
      ],
      "chest": [
       402.5,
       430.0
      ],
      "foreleg": [
       381.1,
       492.9
      ],
      "wing": [
       409.5,
       359.2
      ],
      "tail": [
       654.8,
       463.2
      ],
      "rider": [
       416.2,
       321.0
      ],
      "bbox": [
       286,
       40,
       885,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       282.0,
       258.1
      ],
      "fire_angle": 241.2,
      "head": [
       346.6,
       241.1
      ],
      "chest": [
       410.0,
       437.5
      ],
      "foreleg": [
       393.7,
       501.8
      ],
      "wing": [
       411.7,
       368.0
      ],
      "tail": [
       659.6,
       467.3
      ],
      "rider": [
       419.1,
       328.0
      ],
      "bbox": [
       271,
       73,
       890,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       217.2,
       319.0
      ],
      "fire_angle": 267.2,
      "head": [
       267.3,
       288.5
      ],
      "chest": [
       395.0,
       445.0
      ],
      "foreleg": [
       388.6,
       510.5
      ],
      "wing": [
       391.1,
       376.9
      ],
      "tail": [
       654.3,
       469.4
      ],
      "rider": [
       397.7,
       335.2
      ],
      "bbox": [
       194,
       118,
       879,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       177.8,
       373.8
      ],
      "fire_angle": 285.6,
      "head": [
       217.0,
       334.2
      ],
      "chest": [
       377.5,
       450.0
      ],
      "foreleg": [
       375.7,
       515.5
      ],
      "wing": [
       372.2,
       380.9
      ],
      "tail": [
       649.1,
       470.0
      ],
      "rider": [
       375.9,
       340.1
      ],
      "bbox": [
       149,
       122,
       865,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.7,
       279.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       250.4
      ],
      "chest": [
       365.0,
       345.0
      ],
      "foreleg": [
       371.0,
       407.7
      ],
      "wing": [
       369.5,
       272.2
      ],
      "tail": [
       639.9,
       365.9
      ],
      "rider": [
       370.7,
       235.3
      ],
      "bbox": [
       100,
       0,
       871,
       482
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       373.4
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       871,
       485
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.8,
       380.6
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       34,
       871,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       640.0,
       383.4
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       186,
       869,
       563
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       304.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       275.4
      ],
      "chest": [
       365.0,
       370.0
      ],
      "foreleg": [
       371.4,
       433.1
      ],
      "wing": [
       431.5,
       349.4
      ],
      "tail": [
       639.8,
       380.1
      ],
      "rider": [
       367.8,
       260.2
      ],
      "bbox": [
       100,
       190,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       639.5,
       372.6
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       186,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.5,
       365.3
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       164,
       868,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       362.6
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       869,
       485
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       292.2,
       247.8
      ],
      "fire_angle": 235.2,
      "head": [
       364.8,
       226.5
      ],
      "chest": [
       397.5,
       430.0
      ],
      "foreleg": [
       377.3,
       493.2
      ],
      "wing": [
       404.4,
       359.2
      ],
      "tail": [
       652.3,
       463.2
      ],
      "rider": [
       410.9,
       321.0
      ],
      "bbox": [
       281,
       40,
       883,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       337.3,
       202.7
      ],
      "fire_angle": 223.6,
      "head": [
       417.3,
       190.6
      ],
      "chest": [
       415.0,
       397.5
      ],
      "foreleg": [
       392.0,
       458.9
      ],
      "wing": [
       427.6,
       332.8
      ],
      "tail": [
       657.3,
       461.0
      ],
      "rider": [
       449.0,
       293.0
      ],
      "bbox": [
       314,
       6,
       889,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       251.0,
       281.9
      ],
      "fire_angle": 249.6,
      "head": [
       314.6,
       248.2
      ],
      "chest": [
       405.0,
       437.5
      ],
      "foreleg": [
       393.1,
       502.3
      ],
      "wing": [
       438.4,
       360.5
      ],
      "tail": [
       654.3,
       473.0
      ],
      "rider": [
       415.8,
       328.2
      ],
      "bbox": [
       239,
       133,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.1,
       436.8
      ],
      "fire_angle": 276.4,
      "head": [
       196.5,
       388.2
      ],
      "chest": [
       385.0,
       490.0
      ],
      "foreleg": [
       390.2,
       554.6
      ],
      "wing": [
       430.7,
       415.4
      ],
      "tail": [
       648.3,
       507.3
      ],
      "rider": [
       379.0,
       380.3
      ],
      "bbox": [
       124,
       161,
       867,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       122.2,
       568.5
      ],
      "fire_angle": 284.0,
      "head": [
       160.7,
       522.3
      ],
      "chest": [
       375.0,
       535.0
      ],
      "foreleg": [
       371.8,
       601.1
      ],
      "wing": [
       435.5,
       477.2
      ],
      "tail": [
       647.8,
       549.7
      ],
      "rider": [
       366.1,
       425.5
      ],
      "bbox": [
       91,
       206,
       862,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.6,
       600.9
      ],
      "fire_angle": 278.4,
      "head": [
       154.2,
       563.9
      ],
      "chest": [
       370.0,
       560.0
      ],
      "foreleg": [
       351.4,
       623.5
      ],
      "wing": [
       435.7,
       519.6
      ],
      "tail": [
       646.7,
       581.5
      ],
      "rider": [
       362.6,
       450.4
      ],
      "bbox": [
       83,
       356,
       842,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       103.1,
       593.7
      ],
      "fire_angle": 269.6,
      "head": [
       151.7,
       566.5
      ],
      "chest": [
       367.5,
       565.0
      ],
      "foreleg": [
       346.1,
       627.2
      ],
      "wing": [
       432.8,
       533.5
      ],
      "tail": [
       645.8,
       589.3
      ],
      "rider": [
       360.1,
       455.4
      ],
      "bbox": [
       79,
       361,
       823,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       102.5,
       592.2
      ],
      "fire_angle": 267.2,
      "head": [
       152.1,
       568.4
      ],
      "chest": [
       367.5,
       567.5
      ],
      "foreleg": [
       345.1,
       629.2
      ],
      "wing": [
       430.6,
       544.7
      ],
      "tail": [
       645.8,
       591.9
      ],
      "rider": [
       360.1,
       457.9
      ],
      "bbox": [
       79,
       364,
       823,
       640
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       210.2,
       291.8
      ],
      "fire_angle": 258.4,
      "head": [
       263.8,
       272.0
      ],
      "chest": [
       382.5,
       440.0
      ],
      "foreleg": [
       366.6,
       504.5
      ],
      "wing": [
       383.3,
       369.8
      ],
      "tail": [
       649.4,
       468.8
      ],
      "rider": [
       388.7,
       330.3
      ],
      "bbox": [
       189,
       75,
       876,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       102.5,
       489.7
      ],
      "fire_angle": 279.6,
      "head": [
       143.5,
       441.3
      ],
      "chest": [
       360.0,
       460.0
      ],
      "foreleg": [
       338.7,
       522.4
      ],
      "wing": [
       353.2,
       390.0
      ],
      "tail": [
       643.1,
       477.7
      ],
      "rider": [
       354.0,
       350.3
      ],
      "bbox": [
       72,
       131,
       867,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       99.6,
       591.6
      ],
      "fire_angle": 276.0,
      "head": [
       140.0,
       525.7
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       637.4,
       481.1
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       65,
       162,
       858,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.5,
       580.5
      ],
      "fire_angle": 273.8,
      "head": [
       136.0,
       513.7
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       637.9,
       479.2
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       61,
       162,
       856,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       101.2,
       594.4
      ],
      "fire_angle": 276.6,
      "head": [
       141.2,
       528.7
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       638.6,
       475.6
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       66,
       162,
       853,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       105.8,
       601.7
      ],
      "fire_angle": 278.0,
      "head": [
       144.5,
       536.6
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       639.2,
       471.5
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       71,
       162,
       849,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       132.6,
       416.6
      ],
      "fire_angle": 286.4,
      "head": [
       170.6,
       373.9
      ],
      "chest": [
       362.5,
       455.0
      ],
      "foreleg": [
       370.3,
       518.5
      ],
      "wing": [
       356.4,
       385.4
      ],
      "tail": [
       644.8,
       464.8
      ],
      "rider": [
       358.6,
       345.2
      ],
      "bbox": [
       103,
       127,
       855,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       144.6,
       456.3
      ],
      "fire_angle": 275.6,
      "head": [
       190.0,
       424.1
      ],
      "chest": [
       400.0,
       485.0
      ],
      "foreleg": [
       413.2,
       549.3
      ],
      "wing": [
       429.7,
       402.7
      ],
      "tail": [
       649.9,
       450.7
      ],
      "rider": [
       372.6,
       378.6
      ],
      "bbox": [
       118,
       339,
       881,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       472.9
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       432.5
      ],
      "chest": [
       335.0,
       470.0
      ],
      "foreleg": [
       356.6,
       528.7
      ],
      "wing": [
       369.8,
       389.7
      ],
      "tail": [
       622.4,
       444.9
      ],
      "rider": [
       315.4,
       361.9
      ],
      "bbox": [
       47,
       325,
       854,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       465.4
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       425.0
      ],
      "chest": [
       335.0,
       462.5
      ],
      "foreleg": [
       310.8,
       522.6
      ],
      "wing": [
       372.2,
       383.4
      ],
      "tail": [
       622.4,
       453.3
      ],
      "rider": [
       322.2,
       353.4
      ],
      "bbox": [
       47,
       319,
       855,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       457.9
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       417.5
      ],
      "chest": [
       335.0,
       455.0
      ],
      "foreleg": [
       339.0,
       519.9
      ],
      "wing": [
       374.6,
       377.2
      ],
      "tail": [
       622.4,
       450.8
      ],
      "rider": [
       329.0,
       345.3
      ],
      "bbox": [
       47,
       313,
       852,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       465.4
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       425.0
      ],
      "chest": [
       335.0,
       462.5
      ],
      "foreleg": [
       357.9,
       518.5
      ],
      "wing": [
       372.2,
       383.4
      ],
      "tail": [
       622.2,
       442.4
      ],
      "rider": [
       322.2,
       353.4
      ],
      "bbox": [
       47,
       319,
       852,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       150.3,
       423.0
      ],
      "fire_angle": 285.2,
      "head": [
       188.6,
       378.6
      ],
      "chest": [
       370.0,
       477.5
      ],
      "foreleg": [
       338.5,
       531.0
      ],
      "wing": [
       381.2,
       395.4
      ],
      "tail": [
       651.1,
       477.6
      ],
      "rider": [
       355.6,
       368.6
      ],
      "bbox": [
       120,
       272,
       877,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "slam": {
    "frames": 6,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       235.5,
       254.9
      ],
      "fire_angle": 254.0,
      "head": [
       292.0,
       234.1
      ],
      "chest": [
       395.0,
       412.5
      ],
      "foreleg": [
       396.5,
       473.2
      ],
      "wing": [
       405.4,
       345.1
      ],
      "tail": [
       649.5,
       470.9
      ],
      "rider": [
       420.6,
       305.7
      ],
      "bbox": [
       220,
       18,
       875,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       310.1,
       186.2
      ],
      "fire_angle": 238.4,
      "head": [
       380.2,
       163.2
      ],
      "chest": [
       422.5,
       365.0
      ],
      "foreleg": [
       391.3,
       421.4
      ],
      "wing": [
       440.6,
       309.3
      ],
      "tail": [
       652.0,
       473.0
      ],
      "rider": [
       480.6,
       271.8
      ],
      "bbox": [
       273,
       0,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.0,
       360.6
      ],
      "fire_angle": 272.0,
      "head": [
       201.5,
       310.3
      ],
      "chest": [
       372.5,
       437.5
      ],
      "foreleg": [
       343.3,
       496.6
      ],
      "wing": [
       400.5,
       359.6
      ],
      "tail": [
       646.1,
       477.6
      ],
      "rider": [
       381.1,
       328.0
      ],
      "bbox": [
       128,
       111,
       872,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       99.1,
       536.3
      ],
      "fire_angle": 292.0,
      "head": [
       119.8,
       461.7
      ],
      "chest": [
       335.0,
       490.0
      ],
      "foreleg": [
       328.6,
       556.1
      ],
      "wing": [
       375.3,
       412.7
      ],
      "tail": [
       637.1,
       482.2
      ],
      "rider": [
       314.1,
       382.1
      ],
      "bbox": [
       50,
       284,
       858,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       84.2,
       510.4
      ],
      "fire_angle": 282.8,
      "head": [
       123.1,
       462.4
      ],
      "chest": [
       340.0,
       485.0
      ],
      "foreleg": [
       332.4,
       550.9
      ],
      "wing": [
       354.2,
       401.5
      ],
      "tail": [
       637.6,
       480.1
      ],
      "rider": [
       321.2,
       376.8
      ],
      "bbox": [
       53,
       193,
       857,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       135.1,
       416.6
      ],
      "fire_angle": 286.4,
      "head": [
       173.1,
       373.9
      ],
      "chest": [
       365.0,
       455.0
      ],
      "foreleg": [
       371.9,
       518.8
      ],
      "wing": [
       359.0,
       385.4
      ],
      "tail": [
       643.8,
       473.3
      ],
      "rider": [
       361.1,
       345.2
      ],
      "bbox": [
       105,
       127,
       863,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight_strike": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.7,
       279.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       250.4
      ],
      "chest": [
       365.0,
       345.0
      ],
      "foreleg": [
       371.0,
       407.7
      ],
      "wing": [
       369.5,
       272.2
      ],
      "tail": [
       639.9,
       365.9
      ],
      "rider": [
       370.7,
       235.3
      ],
      "bbox": [
       100,
       0,
       871,
       482
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       373.4
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       871,
       485
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.8,
       380.6
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       34,
       871,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       640.0,
       383.4
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       179,
       869,
       563
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       304.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       275.4
      ],
      "chest": [
       365.0,
       370.0
      ],
      "foreleg": [
       371.4,
       433.1
      ],
      "wing": [
       431.5,
       349.4
      ],
      "tail": [
       639.8,
       380.1
      ],
      "rider": [
       367.8,
       260.2
      ],
      "bbox": [
       100,
       183,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       639.5,
       372.6
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       179,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.5,
       365.3
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       164,
       868,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       362.6
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       869,
       485
      ],
      "breathing_fire": false
     }
    ]
   },
   "wingspread": {
    "frames": 7,
    "fps": 9,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       230.7,
       280.2
      ],
      "fire_angle": 259.2,
      "head": [
       284.6,
       257.0
      ],
      "chest": [
       390.0,
       430.0
      ],
      "foreleg": [
       371.3,
       493.6
      ],
      "wing": [
       397.2,
       359.4
      ],
      "tail": [
       649.5,
       470.9
      ],
      "rider": [
       404.4,
       321.1
      ],
      "bbox": [
       212,
       33,
       875,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       290.1,
       232.4
      ],
      "fire_angle": 242.4,
      "head": [
       353.2,
       216.4
      ],
      "chest": [
       405.0,
       412.5
      ],
      "foreleg": [
       381.5,
       474.2
      ],
      "wing": [
       416.2,
       346.0
      ],
      "tail": [
       652.0,
       473.0
      ],
      "rider": [
       433.5,
       306.4
      ],
      "bbox": [
       279,
       16,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       370.7
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       314.1
      ],
      "chest": [
       372.5,
       437.5
      ],
      "foreleg": [
       358.9,
       502.3
      ],
      "wing": [
       440.9,
       418.3
      ],
      "tail": [
       646.1,
       477.6
      ],
      "rider": [
       381.1,
       328.0
      ],
      "bbox": [
       128,
       244,
       872,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       374.4
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       317.9
      ],
      "chest": [
       372.5,
       441.2
      ],
      "foreleg": [
       359.2,
       506.2
      ],
      "wing": [
       422.3,
       369.4
      ],
      "tail": [
       646.2,
       477.2
      ],
      "rider": [
       378.9,
       331.6
      ],
      "bbox": [
       128,
       147,
       870,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       370.7
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       314.1
      ],
      "chest": [
       372.5,
       437.5
      ],
      "foreleg": [
       358.9,
       502.3
      ],
      "wing": [
       440.9,
       418.3
      ],
      "tail": [
       646.6,
       474.6
      ],
      "rider": [
       381.1,
       328.0
      ],
      "bbox": [
       128,
       244,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       374.4
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       317.9
      ],
      "chest": [
       372.5,
       441.2
      ],
      "foreleg": [
       359.2,
       506.2
      ],
      "wing": [
       422.3,
       369.4
      ],
      "tail": [
       647.1,
       470.7
      ],
      "rider": [
       378.9,
       331.6
      ],
      "bbox": [
       128,
       147,
       864,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.2,
       397.9
      ],
      "fire_angle": 288.4,
      "head": [
       191.7,
       353.9
      ],
      "chest": [
       370.0,
       450.0
      ],
      "foreleg": [
       371.3,
       515.0
      ],
      "wing": [
       364.9,
       381.1
      ],
      "tail": [
       644.6,
       466.9
      ],
      "rider": [
       369.1,
       340.1
      ],
      "bbox": [
       125,
       122,
       856,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_low": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       160.9,
       406.5
      ],
      "fire_angle": 287.6,
      "head": [
       198.7,
       365.5
      ],
      "chest": [
       375.0,
       465.0
      ],
      "foreleg": [
       384.3,
       529.2
      ],
      "wing": [
       365.7,
       393.6
      ],
      "tail": [
       646.5,
       428.5
      ],
      "rider": [
       361.7,
       355.9
      ],
      "bbox": [
       132,
       135,
       875,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.1,
       425.0
      ],
      "fire_angle": 289.6,
      "head": [
       187.4,
       382.8
      ],
      "chest": [
       370.0,
       472.5
      ],
      "foreleg": [
       385.0,
       535.2
      ],
      "wing": [
       358.3,
       399.9
      ],
      "tail": [
       642.6,
       407.4
      ],
      "rider": [
       350.1,
       364.5
      ],
      "bbox": [
       122,
       141,
       858,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.1,
       419.7
      ],
      "fire_angle": 289.6,
      "head": [
       191.5,
       377.5
      ],
      "chest": [
       367.5,
       475.0
      ],
      "foreleg": [
       383.1,
       536.3
      ],
      "wing": [
       410.7,
       399.0
      ],
      "tail": [
       648.7,
       477.2
      ],
      "rider": [
       354.5,
       365.9
      ],
      "bbox": [
       126,
       255,
       880,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       422.2
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       380.0
      ],
      "chest": [
       365.0,
       477.5
      ],
      "foreleg": [
       382.0,
       537.7
      ],
      "wing": [
       408.7,
       401.8
      ],
      "tail": [
       640.7,
       494.7
      ],
      "rider": [
       353.3,
       368.3
      ],
      "bbox": [
       123,
       258,
       865,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       419.7
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       377.5
      ],
      "chest": [
       365.0,
       475.0
      ],
      "foreleg": [
       381.1,
       535.6
      ],
      "wing": [
       356.7,
       404.1
      ],
      "tail": [
       640.1,
       496.3
      ],
      "rider": [
       354.7,
       365.6
      ],
      "bbox": [
       123,
       145,
       862,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.9,
       399.8
      ],
      "fire_angle": 287.6,
      "head": [
       191.7,
       358.9
      ],
      "chest": [
       370.0,
       455.0
      ],
      "foreleg": [
       374.9,
       519.4
      ],
      "wing": [
       364.2,
       385.6
      ],
      "tail": [
       646.9,
       470.1
      ],
      "rider": [
       366.9,
       345.2
      ],
      "bbox": [
       125,
       127,
       861,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_high": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       160.9,
       399.0
      ],
      "fire_angle": 287.6,
      "head": [
       198.7,
       358.0
      ],
      "chest": [
       375.0,
       457.5
      ],
      "foreleg": [
       379.2,
       522.0
      ],
      "wing": [
       369.2,
       388.1
      ],
      "tail": [
       641.7,
       499.5
      ],
      "rider": [
       371.9,
       347.7
      ],
      "bbox": [
       132,
       129,
       845,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.6,
       415.0
      ],
      "fire_angle": 289.6,
      "head": [
       189.9,
       372.8
      ],
      "chest": [
       372.5,
       462.5
      ],
      "foreleg": [
       380.3,
       526.1
      ],
      "wing": [
       366.2,
       392.8
      ],
      "tail": [
       636.7,
       515.1
      ],
      "rider": [
       367.9,
       352.7
      ],
      "bbox": [
       124,
       134,
       821,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.1,
       404.7
      ],
      "fire_angle": 289.6,
      "head": [
       191.5,
       362.5
      ],
      "chest": [
       367.5,
       460.0
      ],
      "foreleg": [
       377.1,
       523.7
      ],
      "wing": [
       411.7,
       384.6
      ],
      "tail": [
       647.4,
       448.0
      ],
      "rider": [
       357.2,
       350.6
      ],
      "bbox": [
       126,
       240,
       871,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       402.2
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       360.0
      ],
      "chest": [
       365.0,
       457.5
      ],
      "foreleg": [
       374.6,
       521.4
      ],
      "wing": [
       408.7,
       381.8
      ],
      "tail": [
       643.8,
       433.0
      ],
      "rider": [
       353.3,
       348.3
      ],
      "bbox": [
       123,
       238,
       868,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       402.2
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       360.0
      ],
      "chest": [
       365.0,
       457.5
      ],
      "foreleg": [
       374.6,
       521.4
      ],
      "wing": [
       356.2,
       386.4
      ],
      "tail": [
       642.1,
       425.2
      ],
      "rider": [
       353.3,
       348.3
      ],
      "bbox": [
       123,
       128,
       865,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.9,
       399.8
      ],
      "fire_angle": 287.6,
      "head": [
       191.7,
       358.9
      ],
      "chest": [
       370.0,
       455.0
      ],
      "foreleg": [
       374.9,
       519.4
      ],
      "wing": [
       364.2,
       385.6
      ],
      "tail": [
       646.9,
       470.1
      ],
      "rider": [
       366.9,
       345.2
      ],
      "bbox": [
       125,
       127,
       861,
       624
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "dragon_vhagar_awakened": {
  "base": "sprites/dragon_vhagar_awakened/dragon_vhagar_awakened_base.png",
  "frame_size": [
   960,
   640
  ],
  "res": 1.25,
  "facing": "left",
  "pivot": [
   480.0,
   607.5
  ],
  "recommended_scale_1080p": 1.5,
  "sheet_pattern": "sprites/dragon_vhagar_awakened/sheets/dragon_vhagar_awakened_{anim}.png",
  "frames_pattern": "sprites/dragon_vhagar_awakened/frames/{anim}/dragon_vhagar_awakened_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       171.7,
       382.0
      ],
      "fire_angle": 289.2,
      "head": [
       208.7,
       341.4
      ],
      "chest": [
       372.5,
       450.0
      ],
      "foreleg": [
       372.9,
       515.2
      ],
      "wing": [
       368.2,
       380.0
      ],
      "tail": [
       646.3,
       471.0
      ],
      "rider": [
       370.9,
       340.1
      ],
      "bbox": [
       143,
       97,
       866,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       180.4,
       387.2
      ],
      "fire_angle": 292.5,
      "head": [
       214.3,
       342.3
      ],
      "chest": [
       372.5,
       452.7
      ],
      "foreleg": [
       374.9,
       517.6
      ],
      "wing": [
       368.7,
       381.9
      ],
      "tail": [
       645.7,
       476.0
      ],
      "rider": [
       370.1,
       342.9
      ],
      "bbox": [
       150,
       93,
       868,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       180.4,
       387.2
      ],
      "fire_angle": 292.5,
      "head": [
       214.3,
       342.3
      ],
      "chest": [
       372.5,
       452.7
      ],
      "foreleg": [
       374.9,
       517.6
      ],
      "wing": [
       368.7,
       381.9
      ],
      "tail": [
       646.2,
       474.0
      ],
      "rider": [
       370.1,
       342.9
      ],
      "bbox": [
       150,
       93,
       864,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       171.7,
       382.0
      ],
      "fire_angle": 289.2,
      "head": [
       208.7,
       341.4
      ],
      "chest": [
       372.5,
       450.0
      ],
      "foreleg": [
       372.9,
       515.2
      ],
      "wing": [
       368.2,
       380.0
      ],
      "tail": [
       647.0,
       466.9
      ],
      "rider": [
       370.9,
       340.1
      ],
      "bbox": [
       143,
       97,
       859,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.6,
       379.6
      ],
      "fire_angle": 286.6,
      "head": [
       203.5,
       340.6
      ],
      "chest": [
       372.5,
       447.3
      ],
      "foreleg": [
       370.5,
       512.8
      ],
      "wing": [
       367.8,
       378.1
      ],
      "tail": [
       647.3,
       462.0
      ],
      "rider": [
       371.7,
       337.4
      ],
      "bbox": [
       136,
       101,
       858,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.6,
       379.6
      ],
      "fire_angle": 286.6,
      "head": [
       203.5,
       340.6
      ],
      "chest": [
       372.5,
       447.3
      ],
      "foreleg": [
       370.5,
       512.8
      ],
      "wing": [
       367.8,
       378.1
      ],
      "tail": [
       647.1,
       464.0
      ],
      "rider": [
       371.7,
       337.4
      ],
      "bbox": [
       136,
       101,
       861,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       159.3,
       393.4
      ],
      "fire_angle": 287.6,
      "head": [
       197.1,
       352.4
      ],
      "chest": [
       370.0,
       455.6
      ],
      "foreleg": [
       364.1,
       521.6
      ],
      "wing": [
       407.8,
       377.2
      ],
      "tail": [
       646.7,
       468.3
      ],
      "rider": [
       365.1,
       345.9
      ],
      "bbox": [
       130,
       235,
       870,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       163.2,
       386.4
      ],
      "fire_angle": 287.6,
      "head": [
       201.0,
       345.5
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       365.7,
       518.2
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       646.2,
       474.6
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       134,
       228,
       872,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.8,
       381.7
      ],
      "fire_angle": 287.6,
      "head": [
       202.6,
       340.8
      ],
      "chest": [
       370.0,
       449.4
      ],
      "foreleg": [
       366.4,
       514.8
      ],
      "wing": [
       410.0,
       372.4
      ],
      "tail": [
       646.2,
       477.3
      ],
      "rider": [
       371.6,
       339.5
      ],
      "bbox": [
       136,
       224,
       871,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       163.2,
       386.4
      ],
      "fire_angle": 287.6,
      "head": [
       201.0,
       345.5
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       373.2,
       517.1
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       646.8,
       471.2
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       134,
       228,
       867,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.3,
       393.4
      ],
      "fire_angle": 287.6,
      "head": [
       197.1,
       352.4
      ],
      "chest": [
       370.0,
       455.6
      ],
      "foreleg": [
       378.8,
       518.9
      ],
      "wing": [
       407.8,
       377.2
      ],
      "tail": [
       647.3,
       463.3
      ],
      "rider": [
       365.1,
       345.9
      ],
      "bbox": [
       130,
       235,
       862,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.7,
       394.2
      ],
      "fire_angle": 287.6,
      "head": [
       193.5,
       353.3
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       379.3,
       515.1
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       647.5,
       461.9
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       127,
       236,
       861,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       154.2,
       392.7
      ],
      "fire_angle": 287.6,
      "head": [
       192.0,
       351.8
      ],
      "chest": [
       370.0,
       449.4
      ],
      "foreleg": [
       384.5,
       508.5
      ],
      "wing": [
       410.0,
       372.4
      ],
      "tail": [
       647.5,
       464.3
      ],
      "rider": [
       371.6,
       339.5
      ],
      "bbox": [
       125,
       235,
       863,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.7,
       394.2
      ],
      "fire_angle": 287.6,
      "head": [
       193.5,
       353.3
      ],
      "chest": [
       370.0,
       452.5
      ],
      "foreleg": [
       377.9,
       515.7
      ],
      "wing": [
       408.9,
       374.8
      ],
      "tail": [
       647.2,
       465.4
      ],
      "rider": [
       368.3,
       342.6
      ],
      "bbox": [
       127,
       236,
       866,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       212.8,
       299.3
      ],
      "fire_angle": 264.8,
      "head": [
       263.1,
       278.9
      ],
      "chest": [
       387.5,
       437.5
      ],
      "foreleg": [
       370.1,
       501.6
      ],
      "wing": [
       388.1,
       368.3
      ],
      "tail": [
       649.4,
       469.3
      ],
      "rider": [
       395.5,
       327.9
      ],
      "bbox": [
       190,
       80,
       876,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       256.2,
       260.6
      ],
      "fire_angle": 253.2,
      "head": [
       312.1,
       243.1
      ],
      "chest": [
       400.0,
       425.0
      ],
      "foreleg": [
       380.8,
       488.4
      ],
      "wing": [
       407.9,
       355.1
      ],
      "tail": [
       652.0,
       468.9
      ],
      "rider": [
       416.9,
       316.4
      ],
      "bbox": [
       240,
       28,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       516.8
      ],
      "fire_angle": 311.6,
      "head": [
       131.6,
       436.4
      ],
      "chest": [
       340.0,
       460.0
      ],
      "foreleg": [
       330.6,
       525.7
      ],
      "wing": [
       353.1,
       379.8
      ],
      "tail": [
       632.1,
       482.0
      ],
      "rider": [
       334.0,
       350.3
      ],
      "bbox": [
       72,
       159,
       853,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       513.6
      ],
      "fire_angle": 302.8,
      "head": [
       119.3,
       466.5
      ],
      "chest": [
       330.0,
       465.0
      ],
      "foreleg": [
       326.7,
       531.1
      ],
      "wing": [
       353.4,
       383.3
      ],
      "tail": [
       627.1,
       482.4
      ],
      "rider": [
       321.4,
       355.5
      ],
      "bbox": [
       62,
       188,
       843,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       112.8,
       478.7
      ],
      "fire_angle": 300.0,
      "head": [
       137.1,
       423.6
      ],
      "chest": [
       342.5,
       460.0
      ],
      "foreleg": [
       341.7,
       525.8
      ],
      "wing": [
       335.7,
       390.0
      ],
      "tail": [
       633.7,
       474.9
      ],
      "rider": [
       336.5,
       350.3
      ],
      "bbox": [
       76,
       131,
       847,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.0,
       403.7
      ],
      "fire_angle": 291.6,
      "head": [
       189.9,
       360.2
      ],
      "chest": [
       367.5,
       452.5
      ],
      "foreleg": [
       371.8,
       517.0
      ],
      "wing": [
       361.9,
       383.2
      ],
      "tail": [
       644.6,
       467.4
      ],
      "rider": [
       365.1,
       342.7
      ],
      "bbox": [
       125,
       124,
       856,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       205.8,
       297.8
      ],
      "fire_angle": 261.6,
      "head": [
       257.7,
       277.6
      ],
      "chest": [
       382.5,
       440.0
      ],
      "foreleg": [
       366.6,
       504.5
      ],
      "wing": [
       383.3,
       369.8
      ],
      "tail": [
       649.4,
       468.8
      ],
      "rider": [
       388.7,
       330.3
      ],
      "bbox": [
       184,
       75,
       876,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       263.8,
       247.5
      ],
      "fire_angle": 246.0,
      "head": [
       322.6,
       234.8
      ],
      "chest": [
       397.5,
       425.0
      ],
      "foreleg": [
       377.0,
       488.1
      ],
      "wing": [
       405.3,
       355.0
      ],
      "tail": [
       652.0,
       468.6
      ],
      "rider": [
       414.1,
       316.4
      ],
      "bbox": [
       243,
       28,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       137.8,
       437.2
      ],
      "fire_angle": 292.4,
      "head": [
       160.4,
       367.0
      ],
      "chest": [
       352.5,
       450.0
      ],
      "foreleg": [
       359.8,
       513.2
      ],
      "wing": [
       351.1,
       378.3
      ],
      "tail": [
       638.0,
       478.2
      ],
      "rider": [
       352.0,
       340.1
      ],
      "bbox": [
       92,
       83,
       861,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.2,
       481.8
      ],
      "fire_angle": 298.8,
      "head": [
       137.5,
       403.3
      ],
      "chest": [
       342.5,
       455.0
      ],
      "foreleg": [
       356.0,
       515.7
      ],
      "wing": [
       338.4,
       384.1
      ],
      "tail": [
       635.1,
       480.1
      ],
      "rider": [
       339.1,
       345.2
      ],
      "bbox": [
       71,
       107,
       854,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       128.5,
       478.3
      ],
      "fire_angle": 297.7,
      "head": [
       139.0,
       398.1
      ],
      "chest": [
       342.5,
       456.2
      ],
      "foreleg": [
       356.8,
       516.6
      ],
      "wing": [
       338.5,
       384.8
      ],
      "tail": [
       635.8,
       476.9
      ],
      "rider": [
       338.5,
       346.4
      ],
      "bbox": [
       71,
       104,
       852,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       126.4,
       484.0
      ],
      "fire_angle": 299.5,
      "head": [
       136.6,
       406.6
      ],
      "chest": [
       342.5,
       454.2
      ],
      "foreleg": [
       355.5,
       515.2
      ],
      "wing": [
       338.3,
       383.6
      ],
      "tail": [
       636.5,
       472.9
      ],
      "rider": [
       339.5,
       344.4
      ],
      "bbox": [
       70,
       108,
       848,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       126.5,
       483.8
      ],
      "fire_angle": 299.5,
      "head": [
       136.7,
       406.3
      ],
      "chest": [
       342.5,
       454.3
      ],
      "foreleg": [
       355.6,
       515.2
      ],
      "wing": [
       338.3,
       383.6
      ],
      "tail": [
       637.0,
       469.3
      ],
      "rider": [
       339.5,
       344.5
      ],
      "bbox": [
       70,
       108,
       845,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       151.1,
       406.5
      ],
      "fire_angle": 291.2,
      "head": [
       184.5,
       358.3
      ],
      "chest": [
       362.5,
       452.5
      ],
      "foreleg": [
       368.6,
       516.4
      ],
      "wing": [
       356.9,
       383.2
      ],
      "tail": [
       644.8,
       464.4
      ],
      "rider": [
       360.0,
       342.7
      ],
      "bbox": [
       119,
       124,
       856,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       305.5,
       237.9
      ],
      "fire_angle": 230.4,
      "head": [
       378.1,
       224.9
      ],
      "chest": [
       402.5,
       430.0
      ],
      "foreleg": [
       381.1,
       492.9
      ],
      "wing": [
       409.5,
       359.2
      ],
      "tail": [
       654.8,
       463.2
      ],
      "rider": [
       416.2,
       321.0
      ],
      "bbox": [
       286,
       40,
       885,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       282.0,
       258.1
      ],
      "fire_angle": 241.2,
      "head": [
       346.6,
       241.1
      ],
      "chest": [
       410.0,
       437.5
      ],
      "foreleg": [
       393.7,
       501.8
      ],
      "wing": [
       411.7,
       368.0
      ],
      "tail": [
       659.6,
       467.3
      ],
      "rider": [
       419.1,
       328.0
      ],
      "bbox": [
       271,
       73,
       890,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       217.2,
       319.0
      ],
      "fire_angle": 267.2,
      "head": [
       267.3,
       288.5
      ],
      "chest": [
       395.0,
       445.0
      ],
      "foreleg": [
       388.6,
       510.5
      ],
      "wing": [
       391.1,
       376.9
      ],
      "tail": [
       654.3,
       469.4
      ],
      "rider": [
       397.7,
       335.2
      ],
      "bbox": [
       194,
       118,
       879,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       177.8,
       373.8
      ],
      "fire_angle": 285.6,
      "head": [
       217.0,
       334.2
      ],
      "chest": [
       377.5,
       450.0
      ],
      "foreleg": [
       375.7,
       515.5
      ],
      "wing": [
       372.2,
       380.9
      ],
      "tail": [
       649.1,
       470.0
      ],
      "rider": [
       375.9,
       340.1
      ],
      "bbox": [
       149,
       122,
       865,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.7,
       279.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       250.4
      ],
      "chest": [
       365.0,
       345.0
      ],
      "foreleg": [
       371.0,
       407.7
      ],
      "wing": [
       369.5,
       272.2
      ],
      "tail": [
       639.9,
       365.9
      ],
      "rider": [
       370.7,
       235.3
      ],
      "bbox": [
       100,
       0,
       871,
       482
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       373.4
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       871,
       485
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.8,
       380.6
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       34,
       871,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       640.0,
       383.4
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       186,
       869,
       563
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       304.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       275.4
      ],
      "chest": [
       365.0,
       370.0
      ],
      "foreleg": [
       371.4,
       433.1
      ],
      "wing": [
       431.5,
       349.4
      ],
      "tail": [
       639.8,
       380.1
      ],
      "rider": [
       367.8,
       260.2
      ],
      "bbox": [
       100,
       190,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       639.5,
       372.6
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       186,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.5,
       365.3
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       164,
       868,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       362.6
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       869,
       485
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       292.2,
       247.8
      ],
      "fire_angle": 235.2,
      "head": [
       364.8,
       226.5
      ],
      "chest": [
       397.5,
       430.0
      ],
      "foreleg": [
       377.3,
       493.2
      ],
      "wing": [
       404.4,
       359.2
      ],
      "tail": [
       652.3,
       463.2
      ],
      "rider": [
       410.9,
       321.0
      ],
      "bbox": [
       281,
       40,
       883,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       337.3,
       202.7
      ],
      "fire_angle": 223.6,
      "head": [
       417.3,
       190.6
      ],
      "chest": [
       415.0,
       397.5
      ],
      "foreleg": [
       392.0,
       458.9
      ],
      "wing": [
       427.6,
       332.8
      ],
      "tail": [
       657.3,
       461.0
      ],
      "rider": [
       449.0,
       293.0
      ],
      "bbox": [
       314,
       6,
       889,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       251.0,
       281.9
      ],
      "fire_angle": 249.6,
      "head": [
       314.6,
       248.2
      ],
      "chest": [
       405.0,
       437.5
      ],
      "foreleg": [
       393.1,
       502.3
      ],
      "wing": [
       438.4,
       360.5
      ],
      "tail": [
       654.3,
       473.0
      ],
      "rider": [
       415.8,
       328.2
      ],
      "bbox": [
       239,
       133,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.1,
       436.8
      ],
      "fire_angle": 276.4,
      "head": [
       196.5,
       388.2
      ],
      "chest": [
       385.0,
       490.0
      ],
      "foreleg": [
       390.2,
       554.6
      ],
      "wing": [
       430.7,
       415.4
      ],
      "tail": [
       648.3,
       507.3
      ],
      "bbox": [
       124,
       161,
       867,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       122.2,
       568.5
      ],
      "fire_angle": 284.0,
      "head": [
       160.7,
       522.3
      ],
      "chest": [
       375.0,
       535.0
      ],
      "foreleg": [
       371.8,
       601.1
      ],
      "wing": [
       435.5,
       477.2
      ],
      "tail": [
       647.8,
       549.7
      ],
      "bbox": [
       91,
       206,
       862,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.6,
       600.9
      ],
      "fire_angle": 278.4,
      "head": [
       154.2,
       563.9
      ],
      "chest": [
       370.0,
       560.0
      ],
      "foreleg": [
       351.4,
       623.5
      ],
      "wing": [
       435.7,
       519.6
      ],
      "tail": [
       646.7,
       581.5
      ],
      "bbox": [
       83,
       356,
       842,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       103.1,
       593.7
      ],
      "fire_angle": 269.6,
      "head": [
       151.7,
       566.5
      ],
      "chest": [
       367.5,
       565.0
      ],
      "foreleg": [
       346.1,
       627.2
      ],
      "wing": [
       432.8,
       533.5
      ],
      "tail": [
       645.8,
       589.3
      ],
      "bbox": [
       79,
       361,
       823,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       102.5,
       592.2
      ],
      "fire_angle": 267.2,
      "head": [
       152.1,
       568.4
      ],
      "chest": [
       367.5,
       567.5
      ],
      "foreleg": [
       345.1,
       629.2
      ],
      "wing": [
       430.6,
       544.7
      ],
      "tail": [
       645.8,
       591.9
      ],
      "bbox": [
       79,
       364,
       823,
       640
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       210.2,
       291.8
      ],
      "fire_angle": 258.4,
      "head": [
       263.8,
       272.0
      ],
      "chest": [
       382.5,
       440.0
      ],
      "foreleg": [
       366.6,
       504.5
      ],
      "wing": [
       383.3,
       369.8
      ],
      "tail": [
       649.4,
       468.8
      ],
      "rider": [
       388.7,
       330.3
      ],
      "bbox": [
       189,
       75,
       876,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       102.5,
       489.7
      ],
      "fire_angle": 279.6,
      "head": [
       143.5,
       441.3
      ],
      "chest": [
       360.0,
       460.0
      ],
      "foreleg": [
       338.7,
       522.4
      ],
      "wing": [
       353.2,
       390.0
      ],
      "tail": [
       643.1,
       477.7
      ],
      "rider": [
       354.0,
       350.3
      ],
      "bbox": [
       72,
       131,
       867,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       99.6,
       591.6
      ],
      "fire_angle": 276.0,
      "head": [
       140.0,
       525.7
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       637.4,
       481.1
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       65,
       162,
       858,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.5,
       580.5
      ],
      "fire_angle": 273.8,
      "head": [
       136.0,
       513.7
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       637.9,
       479.2
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       61,
       162,
       856,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       101.2,
       594.4
      ],
      "fire_angle": 276.6,
      "head": [
       141.2,
       528.7
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       638.6,
       475.6
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       66,
       162,
       853,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       105.8,
       601.7
      ],
      "fire_angle": 278.0,
      "head": [
       144.5,
       536.6
      ],
      "chest": [
       337.5,
       475.0
      ],
      "foreleg": [
       327.7,
       540.7
      ],
      "wing": [
       342.5,
       394.9
      ],
      "tail": [
       639.2,
       471.5
      ],
      "rider": [
       323.9,
       366.0
      ],
      "bbox": [
       71,
       162,
       849,
       624
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       132.6,
       416.6
      ],
      "fire_angle": 286.4,
      "head": [
       170.6,
       373.9
      ],
      "chest": [
       362.5,
       455.0
      ],
      "foreleg": [
       370.3,
       518.5
      ],
      "wing": [
       356.4,
       385.4
      ],
      "tail": [
       644.8,
       464.8
      ],
      "rider": [
       358.6,
       345.2
      ],
      "bbox": [
       103,
       127,
       855,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       144.6,
       456.3
      ],
      "fire_angle": 275.6,
      "head": [
       190.0,
       424.1
      ],
      "chest": [
       400.0,
       485.0
      ],
      "foreleg": [
       413.2,
       549.3
      ],
      "wing": [
       429.7,
       402.7
      ],
      "tail": [
       649.9,
       450.7
      ],
      "rider": [
       372.6,
       378.6
      ],
      "bbox": [
       118,
       339,
       881,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       472.9
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       432.5
      ],
      "chest": [
       335.0,
       470.0
      ],
      "foreleg": [
       356.6,
       528.7
      ],
      "wing": [
       369.8,
       389.7
      ],
      "tail": [
       622.4,
       444.9
      ],
      "rider": [
       315.4,
       361.9
      ],
      "bbox": [
       47,
       325,
       854,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       465.4
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       425.0
      ],
      "chest": [
       335.0,
       462.5
      ],
      "foreleg": [
       310.8,
       522.6
      ],
      "wing": [
       372.2,
       383.4
      ],
      "tail": [
       622.4,
       453.3
      ],
      "rider": [
       322.2,
       353.4
      ],
      "bbox": [
       47,
       319,
       855,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       457.9
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       417.5
      ],
      "chest": [
       335.0,
       455.0
      ],
      "foreleg": [
       339.0,
       519.9
      ],
      "wing": [
       374.6,
       377.2
      ],
      "tail": [
       622.4,
       450.8
      ],
      "rider": [
       329.0,
       345.3
      ],
      "bbox": [
       47,
       313,
       852,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       74.5,
       465.4
      ],
      "fire_angle": 276.0,
      "head": [
       119.1,
       425.0
      ],
      "chest": [
       335.0,
       462.5
      ],
      "foreleg": [
       357.9,
       518.5
      ],
      "wing": [
       372.2,
       383.4
      ],
      "tail": [
       622.2,
       442.4
      ],
      "rider": [
       322.2,
       353.4
      ],
      "bbox": [
       47,
       319,
       852,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       150.3,
       423.0
      ],
      "fire_angle": 285.2,
      "head": [
       188.6,
       378.6
      ],
      "chest": [
       370.0,
       477.5
      ],
      "foreleg": [
       338.5,
       531.0
      ],
      "wing": [
       381.2,
       395.4
      ],
      "tail": [
       651.1,
       477.6
      ],
      "rider": [
       355.6,
       368.6
      ],
      "bbox": [
       120,
       272,
       877,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "slam": {
    "frames": 6,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       235.5,
       254.9
      ],
      "fire_angle": 254.0,
      "head": [
       292.0,
       234.1
      ],
      "chest": [
       395.0,
       412.5
      ],
      "foreleg": [
       396.5,
       473.2
      ],
      "wing": [
       405.4,
       345.1
      ],
      "tail": [
       649.5,
       470.9
      ],
      "rider": [
       420.6,
       305.7
      ],
      "bbox": [
       220,
       18,
       875,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       310.1,
       186.2
      ],
      "fire_angle": 238.4,
      "head": [
       380.2,
       163.2
      ],
      "chest": [
       422.5,
       365.0
      ],
      "foreleg": [
       391.3,
       421.4
      ],
      "wing": [
       440.6,
       309.3
      ],
      "tail": [
       652.0,
       473.0
      ],
      "rider": [
       480.6,
       271.8
      ],
      "bbox": [
       273,
       0,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.0,
       360.6
      ],
      "fire_angle": 272.0,
      "head": [
       201.5,
       310.3
      ],
      "chest": [
       372.5,
       437.5
      ],
      "foreleg": [
       343.3,
       496.6
      ],
      "wing": [
       400.5,
       359.6
      ],
      "tail": [
       646.1,
       477.6
      ],
      "rider": [
       381.1,
       328.0
      ],
      "bbox": [
       128,
       111,
       872,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       99.1,
       536.3
      ],
      "fire_angle": 292.0,
      "head": [
       119.8,
       461.7
      ],
      "chest": [
       335.0,
       490.0
      ],
      "foreleg": [
       328.6,
       556.1
      ],
      "wing": [
       375.3,
       412.7
      ],
      "tail": [
       637.1,
       482.2
      ],
      "rider": [
       314.1,
       382.1
      ],
      "bbox": [
       50,
       284,
       858,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       84.2,
       510.4
      ],
      "fire_angle": 282.8,
      "head": [
       123.1,
       462.4
      ],
      "chest": [
       340.0,
       485.0
      ],
      "foreleg": [
       332.4,
       550.9
      ],
      "wing": [
       354.2,
       401.5
      ],
      "tail": [
       637.6,
       480.1
      ],
      "rider": [
       321.2,
       376.8
      ],
      "bbox": [
       53,
       193,
       857,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       135.1,
       416.6
      ],
      "fire_angle": 286.4,
      "head": [
       173.1,
       373.9
      ],
      "chest": [
       365.0,
       455.0
      ],
      "foreleg": [
       371.9,
       518.8
      ],
      "wing": [
       359.0,
       385.4
      ],
      "tail": [
       643.8,
       473.3
      ],
      "rider": [
       361.1,
       345.2
      ],
      "bbox": [
       105,
       127,
       863,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight_strike": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.7,
       279.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       250.4
      ],
      "chest": [
       365.0,
       345.0
      ],
      "foreleg": [
       371.0,
       407.7
      ],
      "wing": [
       369.5,
       272.2
      ],
      "tail": [
       639.9,
       365.9
      ],
      "rider": [
       370.7,
       235.3
      ],
      "bbox": [
       100,
       0,
       871,
       482
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       373.4
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       871,
       485
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.8,
       380.6
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       34,
       871,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       640.0,
       383.4
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       179,
       869,
       563
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       304.2
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       275.4
      ],
      "chest": [
       365.0,
       370.0
      ],
      "foreleg": [
       371.4,
       433.1
      ],
      "wing": [
       431.5,
       349.4
      ],
      "tail": [
       639.8,
       380.1
      ],
      "rider": [
       367.8,
       260.2
      ],
      "bbox": [
       100,
       183,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       300.5
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       271.7
      ],
      "chest": [
       365.0,
       366.3
      ],
      "foreleg": [
       371.3,
       429.3
      ],
      "wing": [
       434.3,
       328.7
      ],
      "tail": [
       639.5,
       372.6
      ],
      "rider": [
       368.2,
       256.5
      ],
      "bbox": [
       100,
       179,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       291.7
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       262.9
      ],
      "chest": [
       365.0,
       357.5
      ],
      "foreleg": [
       371.2,
       420.4
      ],
      "wing": [
       414.1,
       285.2
      ],
      "tail": [
       639.5,
       365.3
      ],
      "rider": [
       369.2,
       247.7
      ],
      "bbox": [
       100,
       164,
       868,
       492
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       125.7,
       282.8
      ],
      "fire_angle": 274.8,
      "head": [
       171.7,
       254.0
      ],
      "chest": [
       365.0,
       348.7
      ],
      "foreleg": [
       371.1,
       411.4
      ],
      "wing": [
       382.2,
       270.8
      ],
      "tail": [
       639.8,
       362.6
      ],
      "rider": [
       370.2,
       238.9
      ],
      "bbox": [
       100,
       0,
       869,
       485
      ],
      "breathing_fire": false
     }
    ]
   },
   "wingspread": {
    "frames": 7,
    "fps": 9,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       230.7,
       280.2
      ],
      "fire_angle": 259.2,
      "head": [
       284.6,
       257.0
      ],
      "chest": [
       390.0,
       430.0
      ],
      "foreleg": [
       371.3,
       493.6
      ],
      "wing": [
       397.2,
       359.4
      ],
      "tail": [
       649.5,
       470.9
      ],
      "rider": [
       404.4,
       321.1
      ],
      "bbox": [
       212,
       33,
       875,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       290.1,
       232.4
      ],
      "fire_angle": 242.4,
      "head": [
       353.2,
       216.4
      ],
      "chest": [
       405.0,
       412.5
      ],
      "foreleg": [
       381.5,
       474.2
      ],
      "wing": [
       416.2,
       346.0
      ],
      "tail": [
       652.0,
       473.0
      ],
      "rider": [
       433.5,
       306.4
      ],
      "bbox": [
       279,
       16,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       370.7
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       314.1
      ],
      "chest": [
       372.5,
       437.5
      ],
      "foreleg": [
       358.9,
       502.3
      ],
      "wing": [
       440.9,
       418.3
      ],
      "tail": [
       646.1,
       477.6
      ],
      "rider": [
       381.1,
       328.0
      ],
      "bbox": [
       128,
       244,
       872,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       374.4
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       317.9
      ],
      "chest": [
       372.5,
       441.2
      ],
      "foreleg": [
       359.2,
       506.2
      ],
      "wing": [
       422.3,
       369.4
      ],
      "tail": [
       646.2,
       477.2
      ],
      "rider": [
       378.9,
       331.6
      ],
      "bbox": [
       128,
       147,
       870,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       370.7
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       314.1
      ],
      "chest": [
       372.5,
       437.5
      ],
      "foreleg": [
       358.9,
       502.3
      ],
      "wing": [
       440.9,
       418.3
      ],
      "tail": [
       646.6,
       474.6
      ],
      "rider": [
       381.1,
       328.0
      ],
      "bbox": [
       128,
       244,
       867,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       374.4
      ],
      "fire_angle": 276.8,
      "head": [
       200.7,
       317.9
      ],
      "chest": [
       372.5,
       441.2
      ],
      "foreleg": [
       359.2,
       506.2
      ],
      "wing": [
       422.3,
       369.4
      ],
      "tail": [
       647.1,
       470.7
      ],
      "rider": [
       378.9,
       331.6
      ],
      "bbox": [
       128,
       147,
       864,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.2,
       397.9
      ],
      "fire_angle": 288.4,
      "head": [
       191.7,
       353.9
      ],
      "chest": [
       370.0,
       450.0
      ],
      "foreleg": [
       371.3,
       515.0
      ],
      "wing": [
       364.9,
       381.1
      ],
      "tail": [
       644.6,
       466.9
      ],
      "rider": [
       369.1,
       340.1
      ],
      "bbox": [
       125,
       122,
       856,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_low": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       160.9,
       406.5
      ],
      "fire_angle": 287.6,
      "head": [
       198.7,
       365.5
      ],
      "chest": [
       375.0,
       465.0
      ],
      "foreleg": [
       384.3,
       529.2
      ],
      "wing": [
       365.7,
       393.6
      ],
      "tail": [
       646.5,
       428.5
      ],
      "rider": [
       361.7,
       355.9
      ],
      "bbox": [
       132,
       135,
       875,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.1,
       425.0
      ],
      "fire_angle": 289.6,
      "head": [
       187.4,
       382.8
      ],
      "chest": [
       370.0,
       472.5
      ],
      "foreleg": [
       385.0,
       535.2
      ],
      "wing": [
       358.3,
       399.9
      ],
      "tail": [
       642.6,
       407.4
      ],
      "rider": [
       350.1,
       364.5
      ],
      "bbox": [
       122,
       141,
       858,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.1,
       419.7
      ],
      "fire_angle": 289.6,
      "head": [
       191.5,
       377.5
      ],
      "chest": [
       367.5,
       475.0
      ],
      "foreleg": [
       383.1,
       536.3
      ],
      "wing": [
       410.7,
       399.0
      ],
      "tail": [
       648.7,
       477.2
      ],
      "rider": [
       354.5,
       365.9
      ],
      "bbox": [
       126,
       255,
       880,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       422.2
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       380.0
      ],
      "chest": [
       365.0,
       477.5
      ],
      "foreleg": [
       382.0,
       537.7
      ],
      "wing": [
       408.7,
       401.8
      ],
      "tail": [
       640.7,
       494.7
      ],
      "rider": [
       353.3,
       368.3
      ],
      "bbox": [
       123,
       258,
       865,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       419.7
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       377.5
      ],
      "chest": [
       365.0,
       475.0
      ],
      "foreleg": [
       381.1,
       535.6
      ],
      "wing": [
       356.7,
       404.1
      ],
      "tail": [
       640.1,
       496.3
      ],
      "rider": [
       354.7,
       365.6
      ],
      "bbox": [
       123,
       145,
       862,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.9,
       399.8
      ],
      "fire_angle": 287.6,
      "head": [
       191.7,
       358.9
      ],
      "chest": [
       370.0,
       455.0
      ],
      "foreleg": [
       374.9,
       519.4
      ],
      "wing": [
       364.2,
       385.6
      ],
      "tail": [
       646.9,
       470.1
      ],
      "rider": [
       366.9,
       345.2
      ],
      "bbox": [
       125,
       127,
       861,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_high": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       160.9,
       399.0
      ],
      "fire_angle": 287.6,
      "head": [
       198.7,
       358.0
      ],
      "chest": [
       375.0,
       457.5
      ],
      "foreleg": [
       379.2,
       522.0
      ],
      "wing": [
       369.2,
       388.1
      ],
      "tail": [
       641.7,
       499.5
      ],
      "rider": [
       371.9,
       347.7
      ],
      "bbox": [
       132,
       129,
       845,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.6,
       415.0
      ],
      "fire_angle": 289.6,
      "head": [
       189.9,
       372.8
      ],
      "chest": [
       372.5,
       462.5
      ],
      "foreleg": [
       380.3,
       526.1
      ],
      "wing": [
       366.2,
       392.8
      ],
      "tail": [
       636.7,
       515.1
      ],
      "rider": [
       367.9,
       352.7
      ],
      "bbox": [
       124,
       134,
       821,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.1,
       404.7
      ],
      "fire_angle": 289.6,
      "head": [
       191.5,
       362.5
      ],
      "chest": [
       367.5,
       460.0
      ],
      "foreleg": [
       377.1,
       523.7
      ],
      "wing": [
       411.7,
       384.6
      ],
      "tail": [
       647.4,
       448.0
      ],
      "rider": [
       357.2,
       350.6
      ],
      "bbox": [
       126,
       240,
       871,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       402.2
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       360.0
      ],
      "chest": [
       365.0,
       457.5
      ],
      "foreleg": [
       374.6,
       521.4
      ],
      "wing": [
       408.7,
       381.8
      ],
      "tail": [
       643.8,
       433.0
      ],
      "rider": [
       353.3,
       348.3
      ],
      "bbox": [
       123,
       238,
       868,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.6,
       402.2
      ],
      "fire_angle": 289.6,
      "head": [
       189.0,
       360.0
      ],
      "chest": [
       365.0,
       457.5
      ],
      "foreleg": [
       374.6,
       521.4
      ],
      "wing": [
       356.2,
       386.4
      ],
      "tail": [
       642.1,
       425.2
      ],
      "rider": [
       353.3,
       348.3
      ],
      "bbox": [
       123,
       128,
       865,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.9,
       399.8
      ],
      "fire_angle": 287.6,
      "head": [
       191.7,
       358.9
      ],
      "chest": [
       370.0,
       455.0
      ],
      "foreleg": [
       374.9,
       519.4
      ],
      "wing": [
       364.2,
       385.6
      ],
      "tail": [
       646.9,
       470.1
      ],
      "rider": [
       366.9,
       345.2
      ],
      "bbox": [
       125,
       127,
       861,
       624
      ],
      "breathing_fire": false
     }
    ]
   },
   "rise": {
    "frames": 8,
    "fps": 6,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       102.5,
       592.2
      ],
      "fire_angle": 267.2,
      "head": [
       152.1,
       568.4
      ],
      "chest": [
       367.5,
       567.5
      ],
      "foreleg": [
       345.1,
       629.2
      ],
      "wing": [
       430.6,
       544.7
      ],
      "tail": [
       645.8,
       591.9
      ],
      "rider": [
       360.1,
       457.9
      ],
      "bbox": [
       79,
       364,
       823,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       103.1,
       593.7
      ],
      "fire_angle": 269.6,
      "head": [
       151.7,
       566.5
      ],
      "chest": [
       367.5,
       565.0
      ],
      "foreleg": [
       346.1,
       627.2
      ],
      "wing": [
       432.8,
       533.5
      ],
      "tail": [
       645.8,
       589.3
      ],
      "rider": [
       360.1,
       455.4
      ],
      "bbox": [
       79,
       361,
       823,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.6,
       600.9
      ],
      "fire_angle": 278.4,
      "head": [
       154.2,
       563.9
      ],
      "chest": [
       370.0,
       560.0
      ],
      "foreleg": [
       351.4,
       623.5
      ],
      "wing": [
       435.7,
       519.6
      ],
      "tail": [
       646.7,
       581.5
      ],
      "rider": [
       362.6,
       450.4
      ],
      "bbox": [
       83,
       356,
       842,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       122.2,
       568.5
      ],
      "fire_angle": 284.0,
      "head": [
       160.7,
       522.3
      ],
      "chest": [
       375.0,
       535.0
      ],
      "foreleg": [
       371.8,
       601.1
      ],
      "wing": [
       435.5,
       477.2
      ],
      "tail": [
       647.8,
       549.7
      ],
      "rider": [
       366.1,
       425.5
      ],
      "bbox": [
       91,
       206,
       862,
       640
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.1,
       436.8
      ],
      "fire_angle": 276.4,
      "head": [
       196.5,
       388.2
      ],
      "chest": [
       385.0,
       490.0
      ],
      "foreleg": [
       390.2,
       554.6
      ],
      "wing": [
       430.7,
       415.4
      ],
      "tail": [
       648.3,
       507.3
      ],
      "rider": [
       379.0,
       380.3
      ],
      "bbox": [
       124,
       161,
       867,
       624
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       251.0,
       281.9
      ],
      "fire_angle": 249.6,
      "head": [
       314.6,
       248.2
      ],
      "chest": [
       405.0,
       437.5
      ],
      "foreleg": [
       393.1,
       502.3
      ],
      "wing": [
       438.4,
       360.5
      ],
      "tail": [
       654.3,
       473.0
      ],
      "rider": [
       415.8,
       328.2
      ],
      "bbox": [
       230,
       133,
       881,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       337.3,
       202.7
      ],
      "fire_angle": 223.6,
      "head": [
       417.3,
       190.6
      ],
      "chest": [
       415.0,
       397.5
      ],
      "foreleg": [
       392.0,
       458.9
      ],
      "wing": [
       427.6,
       332.8
      ],
      "tail": [
       657.3,
       461.0
      ],
      "rider": [
       449.0,
       293.0
      ],
      "bbox": [
       314,
       6,
       889,
       622
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       292.2,
       247.8
      ],
      "fire_angle": 235.2,
      "head": [
       364.8,
       226.5
      ],
      "chest": [
       397.5,
       430.0
      ],
      "foreleg": [
       377.3,
       493.2
      ],
      "wing": [
       404.4,
       359.2
      ],
      "tail": [
       652.3,
       463.2
      ],
      "rider": [
       410.9,
       321.0
      ],
      "bbox": [
       273,
       40,
       883,
       622
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "dragon_drogon": {
  "base": "sprites/dragon_drogon/dragon_drogon_base.png",
  "frame_size": [
   768,
   512
  ],
  "res": 1,
  "facing": "left",
  "pivot": [
   384.0,
   486
  ],
  "recommended_scale_1080p": 1.3,
  "sheet_pattern": "sprites/dragon_drogon/sheets/dragon_drogon_{anim}.png",
  "frames_pattern": "sprites/dragon_drogon/frames/{anim}/dragon_drogon_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "foreleg": [
       298.3,
       412.2
      ],
      "wing": [
       294.6,
       304.0
      ],
      "tail": [
       517.1,
       376.8
      ],
      "bbox": [
       125,
       77,
       693,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "foreleg": [
       299.9,
       414.1
      ],
      "wing": [
       295.0,
       305.5
      ],
      "tail": [
       516.6,
       380.8
      ],
      "bbox": [
       131,
       74,
       695,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "foreleg": [
       299.9,
       414.1
      ],
      "wing": [
       295.0,
       305.5
      ],
      "tail": [
       516.9,
       379.2
      ],
      "bbox": [
       131,
       74,
       692,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "foreleg": [
       298.3,
       412.2
      ],
      "wing": [
       294.6,
       304.0
      ],
      "tail": [
       517.6,
       373.6
      ],
      "bbox": [
       125,
       77,
       688,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "foreleg": [
       296.4,
       410.2
      ],
      "wing": [
       294.2,
       302.5
      ],
      "tail": [
       517.8,
       369.6
      ],
      "bbox": [
       120,
       80,
       687,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "foreleg": [
       296.4,
       410.2
      ],
      "wing": [
       294.2,
       302.5
      ],
      "tail": [
       517.7,
       371.2
      ],
      "bbox": [
       120,
       80,
       690,
       499
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "foreleg": [
       291.3,
       417.3
      ],
      "wing": [
       326.3,
       301.8
      ],
      "tail": [
       517.4,
       374.6
      ],
      "bbox": [
       115,
       212,
       696,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       292.6,
       414.6
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       516.9,
       379.7
      ],
      "bbox": [
       118,
       207,
       698,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       300.6
      ],
      "fire_angle": 287.6,
      "head": [
       167.5,
       271.9
      ],
      "chest": [
       296.0,
       359.5
      ],
      "foreleg": [
       293.2,
       411.9
      ],
      "wing": [
       328.0,
       297.9
      ],
      "tail": [
       517.0,
       381.9
      ],
      "bbox": [
       120,
       203,
       697,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       298.6,
       413.7
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       517.4,
       377.0
      ],
      "bbox": [
       118,
       207,
       694,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "foreleg": [
       303.0,
       415.1
      ],
      "wing": [
       326.3,
       301.8
      ],
      "tail": [
       517.8,
       370.7
      ],
      "bbox": [
       115,
       212,
       690,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       303.5,
       412.1
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       518.0,
       369.5
      ],
      "bbox": [
       112,
       213,
       689,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.4,
       309.4
      ],
      "fire_angle": 287.6,
      "head": [
       159.0,
       280.7
      ],
      "chest": [
       296.0,
       359.5
      ],
      "foreleg": [
       307.6,
       406.8
      ],
      "wing": [
       328.0,
       297.9
      ],
      "tail": [
       518.0,
       371.4
      ],
      "bbox": [
       111,
       212,
       691,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       302.3,
       412.5
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       517.8,
       372.4
      ],
      "bbox": [
       112,
       213,
       693,
       499
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       180.4,
       238.7
      ],
      "fire_angle": 264.8,
      "head": [
       215.8,
       224.4
      ],
      "chest": [
       310.0,
       350.0
      ],
      "foreleg": [
       296.1,
       401.3
      ],
      "wing": [
       310.5,
       294.7
      ],
      "tail": [
       519.5,
       375.4
      ],
      "bbox": [
       163,
       64,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.2,
       209.3
      ],
      "fire_angle": 253.2,
      "head": [
       254.5,
       197.0
      ],
      "chest": [
       320.0,
       340.0
      ],
      "foreleg": [
       304.6,
       390.7
      ],
      "wing": [
       326.3,
       284.1
      ],
      "tail": [
       521.6,
       375.1
      ],
      "bbox": [
       203,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       116.9,
       403.8
      ],
      "fire_angle": 311.6,
      "head": [
       110.4,
       347.2
      ],
      "chest": [
       272.0,
       368.0
      ],
      "foreleg": [
       264.5,
       420.6
      ],
      "wing": [
       282.5,
       303.8
      ],
      "tail": [
       505.7,
       385.6
      ],
      "bbox": [
       68,
       126,
       683,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       81.3,
       404.1
      ],
      "fire_angle": 302.8,
      "head": [
       100.4,
       371.0
      ],
      "chest": [
       264.0,
       372.0
      ],
      "foreleg": [
       261.3,
       424.9
      ],
      "wing": [
       282.8,
       306.6
      ],
      "tail": [
       501.7,
       385.9
      ],
      "bbox": [
       59,
       150,
       675,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       97.8,
       375.9
      ],
      "fire_angle": 300.0,
      "head": [
       114.8,
       337.2
      ],
      "chest": [
       274.0,
       368.0
      ],
      "foreleg": [
       273.3,
       420.6
      ],
      "wing": [
       268.6,
       312.0
      ],
      "tail": [
       507.0,
       379.9
      ],
      "bbox": [
       71,
       104,
       678,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.7,
       317.5
      ],
      "fire_angle": 291.6,
      "head": [
       157.2,
       287.0
      ],
      "chest": [
       294.0,
       362.0
      ],
      "foreleg": [
       297.4,
       413.6
      ],
      "wing": [
       289.6,
       306.6
      ],
      "tail": [
       515.7,
       373.9
      ],
      "bbox": [
       111,
       99,
       685,
       499
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       237.9
      ],
      "fire_angle": 261.6,
      "head": [
       211.4,
       223.7
      ],
      "chest": [
       306.0,
       352.0
      ],
      "foreleg": [
       293.3,
       403.6
      ],
      "wing": [
       306.6,
       295.9
      ],
      "tail": [
       519.6,
       375.1
      ],
      "bbox": [
       158,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       221.2,
       199.9
      ],
      "fire_angle": 246.0,
      "head": [
       262.5,
       191.0
      ],
      "chest": [
       318.0,
       340.0
      ],
      "foreleg": [
       301.6,
       390.5
      ],
      "wing": [
       324.3,
       284.0
      ],
      "tail": [
       521.6,
       374.9
      ],
      "bbox": [
       205,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.9,
       342.5
      ],
      "fire_angle": 292.4,
      "head": [
       133.8,
       293.2
      ],
      "chest": [
       282.0,
       360.0
      ],
      "foreleg": [
       287.8,
       410.6
      ],
      "wing": [
       280.9,
       302.6
      ],
      "tail": [
       510.4,
       382.6
      ],
      "bbox": [
       84,
       66,
       690,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       108.2,
       377.0
      ],
      "fire_angle": 298.8,
      "head": [
       115.4,
       321.8
      ],
      "chest": [
       274.0,
       364.0
      ],
      "foreleg": [
       284.8,
       412.6
      ],
      "wing": [
       270.7,
       307.2
      ],
      "tail": [
       508.1,
       384.1
      ],
      "bbox": [
       67,
       85,
       684,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       109.2,
       374.2
      ],
      "fire_angle": 297.7,
      "head": [
       116.6,
       317.9
      ],
      "chest": [
       274.0,
       364.9
      ],
      "foreleg": [
       285.5,
       413.3
      ],
      "wing": [
       270.8,
       307.9
      ],
      "tail": [
       508.7,
       381.6
      ],
      "bbox": [
       68,
       83,
       682,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.5,
       378.8
      ],
      "fire_angle": 299.5,
      "head": [
       114.7,
       324.4
      ],
      "chest": [
       274.0,
       363.4
      ],
      "foreleg": [
       284.4,
       412.1
      ],
      "wing": [
       270.6,
       306.8
      ],
      "tail": [
       509.2,
       378.3
      ],
      "bbox": [
       67,
       86,
       679,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.6,
       378.6
      ],
      "fire_angle": 299.5,
      "head": [
       114.8,
       324.1
      ],
      "chest": [
       274.0,
       363.4
      ],
      "foreleg": [
       284.5,
       412.2
      ],
      "wing": [
       270.6,
       306.9
      ],
      "tail": [
       509.6,
       375.4
      ],
      "bbox": [
       67,
       86,
       676,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       129.5,
       319.5
      ],
      "fire_angle": 291.2,
      "head": [
       153.0,
       285.7
      ],
      "chest": [
       290.0,
       362.0
      ],
      "foreleg": [
       294.9,
       413.1
      ],
      "wing": [
       285.5,
       306.6
      ],
      "tail": [
       515.8,
       371.6
      ],
      "bbox": [
       106,
       99,
       685,
       499
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       254.4,
       193.6
      ],
      "fire_angle": 230.4,
      "head": [
       305.4,
       184.5
      ],
      "chest": [
       322.0,
       344.0
      ],
      "foreleg": [
       304.9,
       394.3
      ],
      "wing": [
       327.6,
       287.4
      ],
      "tail": [
       523.8,
       370.6
      ],
      "bbox": [
       235,
       31,
       709,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       235.8,
       208.6
      ],
      "fire_angle": 241.2,
      "head": [
       281.2,
       196.6
      ],
      "chest": [
       328.0,
       350.0
      ],
      "foreleg": [
       315.0,
       401.4
      ],
      "wing": [
       329.4,
       294.4
      ],
      "tail": [
       527.7,
       373.9
      ],
      "bbox": [
       227,
       58,
       712,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.9,
       253.5
      ],
      "fire_angle": 267.2,
      "head": [
       219.1,
       232.1
      ],
      "chest": [
       316.0,
       356.0
      ],
      "foreleg": [
       310.9,
       408.4
      ],
      "wing": [
       312.9,
       301.5
      ],
      "tail": [
       523.5,
       375.5
      ],
      "bbox": [
       167,
       94,
       704,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.5,
       294.5
      ],
      "fire_angle": 285.6,
      "head": [
       179.0,
       266.7
      ],
      "chest": [
       302.0,
       360.0
      ],
      "foreleg": [
       300.6,
       412.4
      ],
      "wing": [
       297.8,
       304.7
      ],
      "tail": [
       519.3,
       376.0
      ],
      "bbox": [
       130,
       97,
       692,
       499
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       220.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       200.6
      ],
      "chest": [
       292.0,
       276.0
      ],
      "foreleg": [
       296.8,
       326.2
      ],
      "wing": [
       295.6,
       217.8
      ],
      "tail": [
       511.9,
       292.7
      ],
      "bbox": [
       91,
       0,
       697,
       385
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "foreleg": [
       296.9,
       329.1
      ],
      "wing": [
       305.8,
       216.7
      ],
      "tail": [
       511.8,
       298.7
      ],
      "bbox": [
       91,
       0,
       698,
       387
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "foreleg": [
       297.0,
       336.3
      ],
      "wing": [
       331.3,
       228.1
      ],
      "tail": [
       511.8,
       304.5
      ],
      "bbox": [
       91,
       27,
       698,
       393
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "foreleg": [
       297.1,
       343.5
      ],
      "wing": [
       347.4,
       262.9
      ],
      "tail": [
       512.0,
       306.7
      ],
      "bbox": [
       91,
       167,
       696,
       451
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       240.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       220.6
      ],
      "chest": [
       292.0,
       296.0
      ],
      "foreleg": [
       297.1,
       346.4
      ],
      "wing": [
       345.2,
       279.5
      ],
      "tail": [
       511.9,
       304.1
      ],
      "bbox": [
       91,
       170,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "foreleg": [
       297.1,
       343.5
      ],
      "wing": [
       347.4,
       262.9
      ],
      "tail": [
       511.6,
       298.1
      ],
      "bbox": [
       91,
       167,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "foreleg": [
       297.0,
       336.3
      ],
      "wing": [
       331.3,
       228.1
      ],
      "tail": [
       511.6,
       292.3
      ],
      "bbox": [
       91,
       130,
       695,
       393
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "foreleg": [
       296.9,
       329.1
      ],
      "wing": [
       305.8,
       216.7
      ],
      "tail": [
       511.8,
       290.0
      ],
      "bbox": [
       91,
       0,
       696,
       387
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       244.1,
       200.5
      ],
      "fire_angle": 235.2,
      "head": [
       295.0,
       185.6
      ],
      "chest": [
       318.0,
       344.0
      ],
      "foreleg": [
       301.8,
       394.6
      ],
      "wing": [
       323.5,
       287.3
      ],
      "tail": [
       521.8,
       370.6
      ],
      "bbox": [
       234,
       31,
       707,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       279.7,
       166.0
      ],
      "fire_angle": 223.6,
      "head": [
       335.9,
       157.5
      ],
      "chest": [
       332.0,
       318.0
      ],
      "foreleg": [
       313.6,
       367.1
      ],
      "wing": [
       342.1,
       266.2
      ],
      "tail": [
       525.9,
       368.8
      ],
      "bbox": [
       256,
       4,
       711,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.3,
       225.6
      ],
      "fire_angle": 249.6,
      "head": [
       256.0,
       201.9
      ],
      "chest": [
       324.0,
       350.0
      ],
      "foreleg": [
       314.5,
       401.9
      ],
      "wing": [
       350.7,
       288.4
      ],
      "tail": [
       523.5,
       378.4
      ],
      "bbox": [
       202,
       106,
       706,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.1,
       345.4
      ],
      "fire_angle": 276.4,
      "head": [
       162.6,
       311.3
      ],
      "chest": [
       308.0,
       392.0
      ],
      "foreleg": [
       312.2,
       443.7
      ],
      "wing": [
       344.5,
       332.3
      ],
      "tail": [
       518.6,
       405.8
      ],
      "bbox": [
       111,
       128,
       694,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       106.9,
       450.1
      ],
      "fire_angle": 284.0,
      "head": [
       134.0,
       417.6
      ],
      "chest": [
       300.0,
       428.0
      ],
      "foreleg": [
       297.4,
       480.9
      ],
      "wing": [
       348.4,
       381.8
      ],
      "tail": [
       518.2,
       439.8
      ],
      "bbox": [
       84,
       164,
       690,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.2,
       477.3
      ],
      "fire_angle": 278.4,
      "head": [
       128.8,
       451.3
      ],
      "chest": [
       296.0,
       448.0
      ],
      "foreleg": [
       281.1,
       498.8
      ],
      "wing": [
       348.5,
       415.7
      ],
      "tail": [
       517.3,
       465.2
      ],
      "bbox": [
       78,
       284,
       674,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.6,
       473.2
      ],
      "fire_angle": 269.6,
      "head": [
       126.7,
       454.1
      ],
      "chest": [
       294.0,
       452.0
      ],
      "foreleg": [
       276.9,
       501.8
      ],
      "wing": [
       346.2,
       426.8
      ],
      "tail": [
       516.6,
       471.4
      ],
      "bbox": [
       75,
       288,
       659,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       472.5
      ],
      "fire_angle": 267.2,
      "head": [
       127.0,
       455.8
      ],
      "chest": [
       294.0,
       454.0
      ],
      "foreleg": [
       276.1,
       503.4
      ],
      "wing": [
       344.5,
       435.7
      ],
      "tail": [
       516.6,
       473.5
      ],
      "bbox": [
       75,
       290,
       659,
       512
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       178.5,
       233.5
      ],
      "fire_angle": 258.4,
      "head": [
       216.1,
       219.6
      ],
      "chest": [
       306.0,
       352.0
      ],
      "foreleg": [
       293.3,
       403.6
      ],
      "wing": [
       306.6,
       295.9
      ],
      "tail": [
       519.6,
       375.1
      ],
      "bbox": [
       162,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       91.4,
       387.4
      ],
      "fire_angle": 279.6,
      "head": [
       120.3,
       353.4
      ],
      "chest": [
       288.0,
       368.0
      ],
      "foreleg": [
       271.0,
       417.9
      ],
      "wing": [
       282.6,
       312.0
      ],
      "tail": [
       514.5,
       382.1
      ],
      "bbox": [
       68,
       104,
       694,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       88.9,
       468.2
      ],
      "fire_angle": 276.0,
      "head": [
       117.3,
       421.8
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       509.9,
       384.9
      ],
      "bbox": [
       63,
       129,
       687,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       84.2,
       459.4
      ],
      "fire_angle": 273.8,
      "head": [
       114.0,
       412.5
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       510.3,
       383.4
      ],
      "bbox": [
       59,
       129,
       685,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       90.2,
       470.4
      ],
      "fire_angle": 276.6,
      "head": [
       118.3,
       424.2
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       510.9,
       380.5
      ],
      "bbox": [
       64,
       129,
       683,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.8,
       476.0
      ],
      "fire_angle": 278.0,
      "head": [
       121.0,
       430.3
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       511.4,
       377.2
      ],
      "bbox": [
       67,
       129,
       680,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       115.2,
       328.5
      ],
      "fire_angle": 286.4,
      "head": [
       141.9,
       298.5
      ],
      "chest": [
       290.0,
       364.0
      ],
      "foreleg": [
       296.3,
       414.8
      ],
      "wing": [
       285.2,
       308.3
      ],
      "tail": [
       515.8,
       371.8
      ],
      "bbox": [
       93,
       101,
       685,
       499
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.5,
       362.2
      ],
      "fire_angle": 275.6,
      "head": [
       157.5,
       339.6
      ],
      "chest": [
       320.0,
       388.0
      ],
      "foreleg": [
       330.6,
       439.4
      ],
      "wing": [
       343.7,
       322.2
      ],
      "tail": [
       519.9,
       360.5
      ],
      "bbox": [
       106,
       271,
       706,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       374.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       346.5
      ],
      "chest": [
       268.0,
       376.0
      ],
      "foreleg": [
       285.3,
       422.9
      ],
      "wing": [
       295.8,
       311.8
      ],
      "tail": [
       498.0,
       355.9
      ],
      "bbox": [
       49,
       260,
       684,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "foreleg": [
       248.6,
       418.0
      ],
      "wing": [
       297.8,
       306.7
      ],
      "tail": [
       497.9,
       362.6
      ],
      "bbox": [
       49,
       255,
       684,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       362.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       334.5
      ],
      "chest": [
       268.0,
       364.0
      ],
      "foreleg": [
       271.2,
       416.0
      ],
      "wing": [
       299.7,
       301.8
      ],
      "tail": [
       497.9,
       360.6
      ],
      "bbox": [
       49,
       250,
       682,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "foreleg": [
       286.3,
       414.8
      ],
      "wing": [
       297.8,
       306.7
      ],
      "tail": [
       497.7,
       353.9
      ],
      "bbox": [
       49,
       255,
       682,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.4,
       333.7
      ],
      "fire_angle": 285.2,
      "head": [
       156.3,
       302.4
      ],
      "chest": [
       296.0,
       382.0
      ],
      "foreleg": [
       270.8,
       424.8
      ],
      "wing": [
       305.0,
       316.4
      ],
      "tail": [
       520.9,
       382.1
      ],
      "bbox": [
       107,
       232,
       702,
       499
      ],
      "breathing_fire": false
     }
    ]
   },
   "breath_level": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       232.8
      ],
      "fire_angle": 257.6,
      "head": [
       212.3,
       221.2
      ],
      "chest": [
       306.0,
       352.0
      ],
      "foreleg": [
       293.3,
       403.6
      ],
      "wing": [
       306.6,
       295.9
      ],
      "tail": [
       519.6,
       375.1
      ],
      "bbox": [
       159,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.6,
       207.9
      ],
      "fire_angle": 248.0,
      "head": [
       252.6,
       197.5
      ],
      "chest": [
       316.0,
       344.0
      ],
      "foreleg": [
       300.3,
       394.7
      ],
      "wing": [
       321.4,
       287.3
      ],
      "tail": [
       521.6,
       374.9
      ],
      "bbox": [
       195,
       25,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.8,
       339.0
      ],
      "fire_angle": 277.6,
      "head": [
       127.2,
       297.1
      ],
      "chest": [
       284.0,
       362.0
      ],
      "foreleg": [
       290.7,
       412.4
      ],
      "wing": [
       282.5,
       304.4
      ],
      "tail": [
       512.4,
       382.6
      ],
      "bbox": [
       74,
       68,
       692,
       499
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       89.6,
       358.7
      ],
      "fire_angle": 280.0,
      "head": [
       114.8,
       310.5
      ],
      "chest": [
       276.0,
       366.0
      ],
      "foreleg": [
       287.6,
       414.3
      ],
      "wing": [
       272.6,
       308.8
      ],
      "tail": [
       508.1,
       384.1
      ],
      "bbox": [
       61,
       83,
       684,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       91.5,
       356.9
      ],
      "fire_angle": 279.8,
      "head": [
       116.3,
       307.1
      ],
      "chest": [
       276.0,
       366.9
      ],
      "foreleg": [
       288.2,
       415.0
      ],
      "wing": [
       272.5,
       309.6
      ],
      "tail": [
       508.7,
       381.6
      ],
      "bbox": [
       62,
       84,
       682,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.5,
       360.0
      ],
      "fire_angle": 280.1,
      "head": [
       113.9,
       312.7
      ],
      "chest": [
       276.0,
       365.4
      ],
      "foreleg": [
       287.2,
       413.9
      ],
      "wing": [
       272.7,
       308.2
      ],
      "tail": [
       509.2,
       378.3
      ],
      "bbox": [
       60,
       83,
       679,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.6,
       359.8
      ],
      "fire_angle": 280.1,
      "head": [
       114.0,
       312.5
      ],
      "chest": [
       276.0,
       365.4
      ],
      "foreleg": [
       287.3,
       413.9
      ],
      "wing": [
       272.7,
       308.3
      ],
      "tail": [
       509.6,
       375.4
      ],
      "bbox": [
       60,
       83,
       676,
       499
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       130.1,
       317.4
      ],
      "fire_angle": 289.2,
      "head": [
       154.7,
       284.3
      ],
      "chest": [
       292.0,
       362.0
      ],
      "foreleg": [
       296.2,
       413.4
      ],
      "wing": [
       287.5,
       306.6
      ],
      "tail": [
       515.8,
       371.6
      ],
      "bbox": [
       107,
       99,
       685,
       499
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "dragon_viserion": {
  "base": "sprites/dragon_viserion/dragon_viserion_base.png",
  "frame_size": [
   768,
   512
  ],
  "res": 1,
  "facing": "left",
  "pivot": [
   384.0,
   486
  ],
  "recommended_scale_1080p": 1.15,
  "sheet_pattern": "sprites/dragon_viserion/sheets/dragon_viserion_{anim}.png",
  "frames_pattern": "sprites/dragon_viserion/frames/{anim}/dragon_viserion_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "foreleg": [
       298.3,
       412.2
      ],
      "wing": [
       294.6,
       304.0
      ],
      "tail": [
       517.1,
       376.8
      ],
      "bbox": [
       125,
       77,
       693,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "foreleg": [
       299.9,
       414.1
      ],
      "wing": [
       295.0,
       305.5
      ],
      "tail": [
       516.6,
       380.8
      ],
      "bbox": [
       131,
       74,
       695,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       304.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       272.6
      ],
      "chest": [
       298.0,
       362.2
      ],
      "foreleg": [
       299.9,
       414.1
      ],
      "wing": [
       295.0,
       305.5
      ],
      "tail": [
       516.9,
       379.2
      ],
      "bbox": [
       131,
       74,
       692,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.3,
       300.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       272.1
      ],
      "chest": [
       298.0,
       360.0
      ],
      "foreleg": [
       298.3,
       412.2
      ],
      "wing": [
       294.6,
       304.0
      ],
      "tail": [
       517.6,
       373.6
      ],
      "bbox": [
       125,
       77,
       688,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "foreleg": [
       296.4,
       410.2
      ],
      "wing": [
       294.2,
       302.5
      ],
      "tail": [
       517.8,
       369.6
      ],
      "bbox": [
       120,
       80,
       687,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       299.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       271.8
      ],
      "chest": [
       298.0,
       357.8
      ],
      "foreleg": [
       296.4,
       410.2
      ],
      "wing": [
       294.2,
       302.5
      ],
      "tail": [
       517.7,
       371.2
      ],
      "bbox": [
       120,
       80,
       690,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "foreleg": [
       291.3,
       417.3
      ],
      "wing": [
       326.3,
       301.8
      ],
      "tail": [
       517.4,
       374.6
      ],
      "bbox": [
       115,
       220,
       696,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       292.6,
       414.6
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       516.9,
       379.7
      ],
      "bbox": [
       118,
       215,
       698,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       300.6
      ],
      "fire_angle": 287.6,
      "head": [
       167.5,
       271.9
      ],
      "chest": [
       296.0,
       359.5
      ],
      "foreleg": [
       293.2,
       411.9
      ],
      "wing": [
       328.0,
       297.9
      ],
      "tail": [
       517.0,
       381.9
      ],
      "bbox": [
       120,
       211,
       697,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       304.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       275.6
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       298.6,
       413.7
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       517.4,
       377.0
      ],
      "bbox": [
       118,
       215,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.5,
       309.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       281.2
      ],
      "chest": [
       296.0,
       364.5
      ],
      "foreleg": [
       303.0,
       415.1
      ],
      "wing": [
       326.3,
       301.8
      ],
      "tail": [
       517.8,
       370.7
      ],
      "bbox": [
       115,
       220,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       303.5,
       412.1
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       518.0,
       369.5
      ],
      "bbox": [
       112,
       221,
       689,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.4,
       309.4
      ],
      "fire_angle": 287.6,
      "head": [
       159.0,
       280.7
      ],
      "chest": [
       296.0,
       359.5
      ],
      "foreleg": [
       307.6,
       406.8
      ],
      "wing": [
       328.0,
       297.9
      ],
      "tail": [
       518.0,
       371.4
      ],
      "bbox": [
       111,
       220,
       691,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       310.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       281.8
      ],
      "chest": [
       296.0,
       362.0
      ],
      "foreleg": [
       302.3,
       412.5
      ],
      "wing": [
       327.1,
       299.8
      ],
      "tail": [
       517.8,
       372.4
      ],
      "bbox": [
       112,
       221,
       693,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       180.4,
       238.7
      ],
      "fire_angle": 264.8,
      "head": [
       215.8,
       224.4
      ],
      "chest": [
       310.0,
       350.0
      ],
      "foreleg": [
       296.1,
       401.3
      ],
      "wing": [
       310.5,
       294.7
      ],
      "tail": [
       519.5,
       375.4
      ],
      "bbox": [
       163,
       64,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.2,
       209.3
      ],
      "fire_angle": 253.2,
      "head": [
       254.5,
       197.0
      ],
      "chest": [
       320.0,
       340.0
      ],
      "foreleg": [
       304.6,
       390.7
      ],
      "wing": [
       326.3,
       284.1
      ],
      "tail": [
       521.6,
       375.1
      ],
      "bbox": [
       203,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       116.9,
       403.8
      ],
      "fire_angle": 311.6,
      "head": [
       110.4,
       347.2
      ],
      "chest": [
       272.0,
       368.0
      ],
      "foreleg": [
       264.5,
       420.6
      ],
      "wing": [
       282.5,
       303.8
      ],
      "tail": [
       505.7,
       385.6
      ],
      "bbox": [
       68,
       126,
       683,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       81.3,
       404.1
      ],
      "fire_angle": 302.8,
      "head": [
       100.4,
       371.0
      ],
      "chest": [
       264.0,
       372.0
      ],
      "foreleg": [
       261.3,
       424.9
      ],
      "wing": [
       282.8,
       306.6
      ],
      "tail": [
       501.7,
       385.9
      ],
      "bbox": [
       59,
       150,
       675,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       97.8,
       375.9
      ],
      "fire_angle": 300.0,
      "head": [
       114.8,
       337.2
      ],
      "chest": [
       274.0,
       368.0
      ],
      "foreleg": [
       273.3,
       420.6
      ],
      "wing": [
       268.6,
       312.0
      ],
      "tail": [
       507.0,
       379.9
      ],
      "bbox": [
       71,
       104,
       678,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.7,
       317.5
      ],
      "fire_angle": 291.6,
      "head": [
       157.2,
       287.0
      ],
      "chest": [
       294.0,
       362.0
      ],
      "foreleg": [
       297.4,
       413.6
      ],
      "wing": [
       289.6,
       306.6
      ],
      "tail": [
       515.7,
       373.9
      ],
      "bbox": [
       111,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       237.9
      ],
      "fire_angle": 261.6,
      "head": [
       211.4,
       223.7
      ],
      "chest": [
       306.0,
       352.0
      ],
      "foreleg": [
       293.3,
       403.6
      ],
      "wing": [
       306.6,
       295.9
      ],
      "tail": [
       519.6,
       375.1
      ],
      "bbox": [
       158,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       221.2,
       199.9
      ],
      "fire_angle": 246.0,
      "head": [
       262.5,
       191.0
      ],
      "chest": [
       318.0,
       340.0
      ],
      "foreleg": [
       301.6,
       390.5
      ],
      "wing": [
       324.3,
       284.0
      ],
      "tail": [
       521.6,
       374.9
      ],
      "bbox": [
       205,
       22,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.9,
       342.5
      ],
      "fire_angle": 292.4,
      "head": [
       133.8,
       293.2
      ],
      "chest": [
       282.0,
       360.0
      ],
      "foreleg": [
       287.8,
       410.6
      ],
      "wing": [
       280.9,
       302.6
      ],
      "tail": [
       510.4,
       382.6
      ],
      "bbox": [
       84,
       66,
       690,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       108.2,
       377.0
      ],
      "fire_angle": 298.8,
      "head": [
       115.4,
       321.8
      ],
      "chest": [
       274.0,
       364.0
      ],
      "foreleg": [
       284.8,
       412.6
      ],
      "wing": [
       270.7,
       307.2
      ],
      "tail": [
       508.1,
       384.1
      ],
      "bbox": [
       67,
       85,
       684,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       109.2,
       374.2
      ],
      "fire_angle": 297.7,
      "head": [
       116.6,
       317.9
      ],
      "chest": [
       274.0,
       364.9
      ],
      "foreleg": [
       285.5,
       413.3
      ],
      "wing": [
       270.8,
       307.9
      ],
      "tail": [
       508.7,
       381.6
      ],
      "bbox": [
       68,
       83,
       682,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.5,
       378.8
      ],
      "fire_angle": 299.5,
      "head": [
       114.7,
       324.4
      ],
      "chest": [
       274.0,
       363.4
      ],
      "foreleg": [
       284.4,
       412.1
      ],
      "wing": [
       270.6,
       306.8
      ],
      "tail": [
       509.2,
       378.3
      ],
      "bbox": [
       67,
       86,
       679,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.6,
       378.6
      ],
      "fire_angle": 299.5,
      "head": [
       114.8,
       324.1
      ],
      "chest": [
       274.0,
       363.4
      ],
      "foreleg": [
       284.5,
       412.2
      ],
      "wing": [
       270.6,
       306.9
      ],
      "tail": [
       509.6,
       375.4
      ],
      "bbox": [
       67,
       86,
       676,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       129.5,
       319.5
      ],
      "fire_angle": 291.2,
      "head": [
       153.0,
       285.7
      ],
      "chest": [
       290.0,
       362.0
      ],
      "foreleg": [
       294.9,
       413.1
      ],
      "wing": [
       285.5,
       306.6
      ],
      "tail": [
       515.8,
       371.6
      ],
      "bbox": [
       106,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       254.4,
       193.6
      ],
      "fire_angle": 230.4,
      "head": [
       305.4,
       184.5
      ],
      "chest": [
       322.0,
       344.0
      ],
      "foreleg": [
       304.9,
       394.3
      ],
      "wing": [
       327.6,
       287.4
      ],
      "tail": [
       523.8,
       370.6
      ],
      "bbox": [
       241,
       31,
       709,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       235.8,
       208.6
      ],
      "fire_angle": 241.2,
      "head": [
       281.2,
       196.6
      ],
      "chest": [
       328.0,
       350.0
      ],
      "foreleg": [
       315.0,
       401.4
      ],
      "wing": [
       329.4,
       294.4
      ],
      "tail": [
       527.7,
       373.9
      ],
      "bbox": [
       227,
       58,
       712,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.9,
       253.5
      ],
      "fire_angle": 267.2,
      "head": [
       219.1,
       232.1
      ],
      "chest": [
       316.0,
       356.0
      ],
      "foreleg": [
       310.9,
       408.4
      ],
      "wing": [
       312.9,
       301.5
      ],
      "tail": [
       523.5,
       375.5
      ],
      "bbox": [
       167,
       94,
       704,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.5,
       294.5
      ],
      "fire_angle": 285.6,
      "head": [
       179.0,
       266.7
      ],
      "chest": [
       302.0,
       360.0
      ],
      "foreleg": [
       300.6,
       412.4
      ],
      "wing": [
       297.8,
       304.7
      ],
      "tail": [
       519.3,
       376.0
      ],
      "bbox": [
       130,
       97,
       692,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       220.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       200.6
      ],
      "chest": [
       292.0,
       276.0
      ],
      "foreleg": [
       296.8,
       326.2
      ],
      "wing": [
       295.6,
       217.8
      ],
      "tail": [
       511.9,
       292.7
      ],
      "bbox": [
       91,
       0,
       697,
       383
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "foreleg": [
       296.9,
       329.1
      ],
      "wing": [
       305.8,
       216.7
      ],
      "tail": [
       511.8,
       298.7
      ],
      "bbox": [
       91,
       0,
       698,
       386
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "foreleg": [
       297.0,
       336.3
      ],
      "wing": [
       331.3,
       228.1
      ],
      "tail": [
       511.8,
       304.5
      ],
      "bbox": [
       91,
       27,
       698,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "foreleg": [
       297.1,
       343.5
      ],
      "wing": [
       347.4,
       262.9
      ],
      "tail": [
       512.0,
       306.7
      ],
      "bbox": [
       91,
       173,
       696,
       451
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       240.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       220.6
      ],
      "chest": [
       292.0,
       296.0
      ],
      "foreleg": [
       297.1,
       346.4
      ],
      "wing": [
       345.2,
       279.5
      ],
      "tail": [
       511.9,
       304.1
      ],
      "bbox": [
       91,
       176,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       238.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       217.7
      ],
      "chest": [
       292.0,
       293.1
      ],
      "foreleg": [
       297.1,
       343.5
      ],
      "wing": [
       347.4,
       262.9
      ],
      "tail": [
       511.6,
       298.1
      ],
      "bbox": [
       91,
       173,
       694,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       230.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       210.6
      ],
      "chest": [
       292.0,
       286.0
      ],
      "foreleg": [
       297.0,
       336.3
      ],
      "wing": [
       331.3,
       228.1
      ],
      "tail": [
       511.6,
       292.3
      ],
      "bbox": [
       91,
       130,
       695,
       391
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       223.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       203.6
      ],
      "chest": [
       292.0,
       278.9
      ],
      "foreleg": [
       296.9,
       329.1
      ],
      "wing": [
       305.8,
       216.7
      ],
      "tail": [
       511.8,
       290.0
      ],
      "bbox": [
       91,
       0,
       696,
       386
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       244.1,
       200.5
      ],
      "fire_angle": 235.2,
      "head": [
       295.0,
       185.6
      ],
      "chest": [
       318.0,
       344.0
      ],
      "foreleg": [
       301.8,
       394.6
      ],
      "wing": [
       323.5,
       287.3
      ],
      "tail": [
       521.8,
       370.6
      ],
      "bbox": [
       235,
       31,
       707,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       279.7,
       166.0
      ],
      "fire_angle": 223.6,
      "head": [
       335.9,
       157.5
      ],
      "chest": [
       332.0,
       318.0
      ],
      "foreleg": [
       313.6,
       367.1
      ],
      "wing": [
       342.1,
       266.2
      ],
      "tail": [
       525.9,
       368.8
      ],
      "bbox": [
       262,
       4,
       711,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.3,
       225.6
      ],
      "fire_angle": 249.6,
      "head": [
       256.0,
       201.9
      ],
      "chest": [
       324.0,
       350.0
      ],
      "foreleg": [
       314.5,
       401.9
      ],
      "wing": [
       350.7,
       288.4
      ],
      "tail": [
       523.5,
       378.4
      ],
      "bbox": [
       202,
       106,
       706,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.1,
       345.4
      ],
      "fire_angle": 276.4,
      "head": [
       162.6,
       311.3
      ],
      "chest": [
       308.0,
       392.0
      ],
      "foreleg": [
       312.2,
       443.7
      ],
      "wing": [
       344.5,
       332.3
      ],
      "tail": [
       518.6,
       405.8
      ],
      "bbox": [
       111,
       128,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       106.9,
       450.1
      ],
      "fire_angle": 284.0,
      "head": [
       134.0,
       417.6
      ],
      "chest": [
       300.0,
       428.0
      ],
      "foreleg": [
       297.4,
       480.9
      ],
      "wing": [
       348.4,
       381.8
      ],
      "tail": [
       518.2,
       439.8
      ],
      "bbox": [
       84,
       164,
       690,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.2,
       477.3
      ],
      "fire_angle": 278.4,
      "head": [
       128.8,
       451.3
      ],
      "chest": [
       296.0,
       448.0
      ],
      "foreleg": [
       281.1,
       498.8
      ],
      "wing": [
       348.5,
       415.7
      ],
      "tail": [
       517.3,
       465.2
      ],
      "bbox": [
       78,
       284,
       673,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.6,
       473.2
      ],
      "fire_angle": 269.6,
      "head": [
       126.7,
       454.1
      ],
      "chest": [
       294.0,
       452.0
      ],
      "foreleg": [
       276.9,
       501.8
      ],
      "wing": [
       346.2,
       426.8
      ],
      "tail": [
       516.6,
       471.4
      ],
      "bbox": [
       75,
       288,
       658,
       512
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       472.5
      ],
      "fire_angle": 267.2,
      "head": [
       127.0,
       455.8
      ],
      "chest": [
       294.0,
       454.0
      ],
      "foreleg": [
       276.1,
       503.4
      ],
      "wing": [
       344.5,
       435.7
      ],
      "tail": [
       516.6,
       473.5
      ],
      "bbox": [
       75,
       290,
       658,
       512
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       178.5,
       233.5
      ],
      "fire_angle": 258.4,
      "head": [
       216.1,
       219.6
      ],
      "chest": [
       306.0,
       352.0
      ],
      "foreleg": [
       293.3,
       403.6
      ],
      "wing": [
       306.6,
       295.9
      ],
      "tail": [
       519.6,
       375.1
      ],
      "bbox": [
       162,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       91.4,
       387.4
      ],
      "fire_angle": 279.6,
      "head": [
       120.3,
       353.4
      ],
      "chest": [
       288.0,
       368.0
      ],
      "foreleg": [
       271.0,
       417.9
      ],
      "wing": [
       282.6,
       312.0
      ],
      "tail": [
       514.5,
       382.1
      ],
      "bbox": [
       68,
       104,
       694,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       88.9,
       468.2
      ],
      "fire_angle": 276.0,
      "head": [
       117.3,
       421.8
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       509.9,
       384.9
      ],
      "bbox": [
       63,
       129,
       687,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       84.2,
       459.4
      ],
      "fire_angle": 273.8,
      "head": [
       114.0,
       412.5
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       510.3,
       383.4
      ],
      "bbox": [
       59,
       129,
       685,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       90.2,
       470.4
      ],
      "fire_angle": 276.6,
      "head": [
       118.3,
       424.2
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       510.9,
       380.5
      ],
      "bbox": [
       64,
       129,
       683,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.8,
       476.0
      ],
      "fire_angle": 278.0,
      "head": [
       121.0,
       430.3
      ],
      "chest": [
       270.0,
       380.0
      ],
      "foreleg": [
       262.2,
       432.6
      ],
      "wing": [
       274.0,
       315.9
      ],
      "tail": [
       511.4,
       377.2
      ],
      "bbox": [
       67,
       129,
       680,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       115.2,
       328.5
      ],
      "fire_angle": 286.4,
      "head": [
       141.9,
       298.5
      ],
      "chest": [
       290.0,
       364.0
      ],
      "foreleg": [
       296.3,
       414.8
      ],
      "wing": [
       285.2,
       308.3
      ],
      "tail": [
       515.8,
       371.8
      ],
      "bbox": [
       93,
       101,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.5,
       362.2
      ],
      "fire_angle": 275.6,
      "head": [
       157.5,
       339.6
      ],
      "chest": [
       320.0,
       388.0
      ],
      "foreleg": [
       330.6,
       439.4
      ],
      "wing": [
       343.7,
       322.2
      ],
      "tail": [
       519.9,
       360.5
      ],
      "bbox": [
       106,
       271,
       706,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       374.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       346.5
      ],
      "chest": [
       268.0,
       376.0
      ],
      "foreleg": [
       285.3,
       422.9
      ],
      "wing": [
       295.8,
       311.8
      ],
      "tail": [
       498.0,
       355.9
      ],
      "bbox": [
       49,
       260,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "foreleg": [
       248.6,
       418.0
      ],
      "wing": [
       297.8,
       306.7
      ],
      "tail": [
       497.9,
       362.6
      ],
      "bbox": [
       49,
       255,
       684,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       362.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       334.5
      ],
      "chest": [
       268.0,
       364.0
      ],
      "foreleg": [
       271.2,
       416.0
      ],
      "wing": [
       299.7,
       301.8
      ],
      "tail": [
       497.9,
       360.6
      ],
      "bbox": [
       49,
       250,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       368.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       340.5
      ],
      "chest": [
       268.0,
       370.0
      ],
      "foreleg": [
       286.3,
       414.8
      ],
      "wing": [
       297.8,
       306.7
      ],
      "tail": [
       497.7,
       353.9
      ],
      "bbox": [
       49,
       255,
       682,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.4,
       333.7
      ],
      "fire_angle": 285.2,
      "head": [
       156.3,
       302.4
      ],
      "chest": [
       296.0,
       382.0
      ],
      "foreleg": [
       270.8,
       424.8
      ],
      "wing": [
       305.0,
       316.4
      ],
      "tail": [
       520.9,
       382.1
      ],
      "bbox": [
       107,
       232,
       702,
       498
      ],
      "breathing_fire": false
     }
    ]
   },
   "breath_level": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       232.8
      ],
      "fire_angle": 257.6,
      "head": [
       212.3,
       221.2
      ],
      "chest": [
       306.0,
       352.0
      ],
      "foreleg": [
       293.3,
       403.6
      ],
      "wing": [
       306.6,
       295.9
      ],
      "tail": [
       519.6,
       375.1
      ],
      "bbox": [
       159,
       59,
       701,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.6,
       207.9
      ],
      "fire_angle": 248.0,
      "head": [
       252.6,
       197.5
      ],
      "chest": [
       316.0,
       344.0
      ],
      "foreleg": [
       300.3,
       394.7
      ],
      "wing": [
       321.4,
       287.3
      ],
      "tail": [
       521.6,
       374.9
      ],
      "bbox": [
       195,
       25,
       705,
       497
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.8,
       339.0
      ],
      "fire_angle": 277.6,
      "head": [
       127.2,
       297.1
      ],
      "chest": [
       284.0,
       362.0
      ],
      "foreleg": [
       290.7,
       412.4
      ],
      "wing": [
       282.5,
       304.4
      ],
      "tail": [
       512.4,
       382.6
      ],
      "bbox": [
       74,
       68,
       692,
       498
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       89.6,
       358.7
      ],
      "fire_angle": 280.0,
      "head": [
       114.8,
       310.5
      ],
      "chest": [
       276.0,
       366.0
      ],
      "foreleg": [
       287.6,
       414.3
      ],
      "wing": [
       272.6,
       308.8
      ],
      "tail": [
       508.1,
       384.1
      ],
      "bbox": [
       61,
       83,
       684,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       91.5,
       356.9
      ],
      "fire_angle": 279.8,
      "head": [
       116.3,
       307.1
      ],
      "chest": [
       276.0,
       366.9
      ],
      "foreleg": [
       288.2,
       415.0
      ],
      "wing": [
       272.5,
       309.6
      ],
      "tail": [
       508.7,
       381.6
      ],
      "bbox": [
       62,
       84,
       682,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.5,
       360.0
      ],
      "fire_angle": 280.1,
      "head": [
       113.9,
       312.7
      ],
      "chest": [
       276.0,
       365.4
      ],
      "foreleg": [
       287.2,
       413.9
      ],
      "wing": [
       272.7,
       308.2
      ],
      "tail": [
       509.2,
       378.3
      ],
      "bbox": [
       60,
       83,
       679,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.6,
       359.8
      ],
      "fire_angle": 280.1,
      "head": [
       114.0,
       312.5
      ],
      "chest": [
       276.0,
       365.4
      ],
      "foreleg": [
       287.3,
       413.9
      ],
      "wing": [
       272.7,
       308.3
      ],
      "tail": [
       509.6,
       375.4
      ],
      "bbox": [
       60,
       83,
       676,
       498
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       130.1,
       317.4
      ],
      "fire_angle": 289.2,
      "head": [
       154.7,
       284.3
      ],
      "chest": [
       292.0,
       362.0
      ],
      "foreleg": [
       296.2,
       413.4
      ],
      "wing": [
       287.5,
       306.6
      ],
      "tail": [
       515.8,
       371.6
      ],
      "bbox": [
       107,
       99,
       685,
       498
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "aegon": {
  "frame_size": [
   336,
   272
  ],
  "pivot": [
   152,
   252
  ],
  "facing": "right",
  "sheet_pattern": "sprites/aegon/aegon_{anim}.png",
  "weapon": "blackfyre",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 8,
    "loop": true,
    "per_frame": [
     {
      "hand": [
       174.0,
       158.0
      ],
      "tip": [
       224.0,
       71.4
      ],
      "shoulder": [
       150.0,
       126.0
      ],
      "weapon_angle": 150.0,
      "bbox": [
       116,
       68,
       227,
       256
      ]
     },
     {
      "hand": [
       174.0,
       159.4
      ],
      "tip": [
       221.4,
       71.3
      ],
      "shoulder": [
       150.4,
       127.1
      ],
      "weapon_angle": 151.7,
      "bbox": [
       113,
       68,
       225,
       256
      ]
     },
     {
      "hand": [
       174.0,
       159.4
      ],
      "tip": [
       221.4,
       71.3
      ],
      "shoulder": [
       150.4,
       127.1
      ],
      "weapon_angle": 151.7,
      "bbox": [
       110,
       68,
       225,
       256
      ]
     },
     {
      "hand": [
       174.0,
       158.0
      ],
      "tip": [
       224.0,
       71.4
      ],
      "shoulder": [
       150.0,
       126.0
      ],
      "weapon_angle": 150.0,
      "bbox": [
       109,
       68,
       227,
       256
      ]
     },
     {
      "hand": [
       174.0,
       156.6
      ],
      "tip": [
       226.6,
       71.6
      ],
      "shoulder": [
       149.6,
       125.0
      ],
      "weapon_angle": 148.3,
      "bbox": [
       112,
       68,
       230,
       255
      ]
     },
     {
      "hand": [
       174.0,
       156.6
      ],
      "tip": [
       226.6,
       71.6
      ],
      "shoulder": [
       149.6,
       125.0
      ],
      "weapon_angle": 148.3,
      "bbox": [
       116,
       68,
       230,
       255
      ]
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "hand": [
       145.0,
       164.0
      ],
      "tip": [
       66.2,
       102.4
      ],
      "shoulder": [
       160.2,
       127.2
      ],
      "weapon_angle": 232.0,
      "bbox": [
       63,
       86,
       192,
       255
      ]
     },
     {
      "hand": [
       148.8,
       165.2
      ],
      "tip": [
       73.3,
       99.7
      ],
      "shoulder": [
       160.2,
       124.2
      ],
      "weapon_angle": 229.1,
      "bbox": [
       70,
       83,
       186,
       254
      ]
     },
     {
      "hand": [
       158.0,
       168.0
      ],
      "tip": [
       91.1,
       93.7
      ],
      "shoulder": [
       160.2,
       121.2
      ],
      "weapon_angle": 222.0,
      "bbox": [
       84,
       80,
       190,
       252
      ]
     },
     {
      "hand": [
       167.2,
       165.2
      ],
      "tip": [
       109.9,
       83.2
      ],
      "shoulder": [
       160.2,
       124.2
      ],
      "weapon_angle": 214.9,
      "bbox": [
       88,
       80,
       192,
       254
      ]
     },
     {
      "hand": [
       171.0,
       164.0
      ],
      "tip": [
       118.0,
       79.2
      ],
      "shoulder": [
       160.2,
       127.2
      ],
      "weapon_angle": 212.0,
      "bbox": [
       91,
       76,
       191,
       255
      ]
     },
     {
      "hand": [
       167.2,
       165.2
      ],
      "tip": [
       109.9,
       83.2
      ],
      "shoulder": [
       160.2,
       124.2
      ],
      "weapon_angle": 214.9,
      "bbox": [
       87,
       80,
       186,
       253
      ]
     },
     {
      "hand": [
       158.0,
       168.0
      ],
      "tip": [
       91.1,
       93.7
      ],
      "shoulder": [
       160.2,
       121.2
      ],
      "weapon_angle": 222.0,
      "bbox": [
       84,
       80,
       192,
       251
      ]
     },
     {
      "hand": [
       148.8,
       165.2
      ],
      "tip": [
       73.3,
       99.7
      ],
      "shoulder": [
       160.2,
       124.2
      ],
      "weapon_angle": 229.1,
      "bbox": [
       70,
       83,
       196,
       254
      ]
     }
    ]
   },
   "slash": {
    "frames": 7,
    "fps": 14,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       154.0,
       118.0
      ],
      "tip": [
       111.7,
       27.4
      ],
      "shoulder": [
       143.5,
       128.1
      ],
      "weapon_angle": 205,
      "bbox": [
       108,
       24,
       182,
       256
      ]
     },
     {
      "hand": [
       140.0,
       110.0
      ],
      "tip": [
       48.6,
       69.3
      ],
      "shoulder": [
       138.5,
       129.3
      ],
      "weapon_angle": 246,
      "bbox": [
       45,
       66,
       182,
       256
      ]
     },
     {
      "hand": [
       172.0,
       114.0
      ],
      "tip": [
       192.8,
       16.2
      ],
      "shoulder": [
       156.0,
       130.3
      ],
      "weapon_angle": 168,
      "bbox": [
       106,
       13,
       196,
       256
      ]
     },
     {
      "hand": [
       198.0,
       148.0
      ],
      "tip": [
       296.5,
       130.6
      ],
      "shoulder": [
       173.2,
       135.8
      ],
      "weapon_angle": 100,
      "bbox": [
       111,
       96,
       300,
       256
      ]
     },
     {
      "hand": [
       190.0,
       184.0
      ],
      "tip": [
       268.8,
       245.6
      ],
      "shoulder": [
       178.0,
       138.9
      ],
      "weapon_angle": 52,
      "bbox": [
       114,
       100,
       272,
       256
      ]
     },
     {
      "hand": [
       180.0,
       166.0
      ],
      "tip": [
       272.7,
       128.5
      ],
      "shoulder": [
       163.4,
       132.0
      ],
      "weapon_angle": 112,
      "bbox": [
       107,
       91,
       276,
       256
      ]
     },
     {
      "hand": [
       174.0,
       158.0
      ],
      "tip": [
       224.0,
       71.4
      ],
      "shoulder": [
       150.0,
       126.0
      ],
      "weapon_angle": 150,
      "bbox": [
       103,
       68,
       227,
       256
      ]
     }
    ]
   },
   "heavy": {
    "frames": 8,
    "fps": 11,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       164.0,
       138.0
      ],
      "tip": [
       181.4,
       39.5
      ],
      "shoulder": [
       146.5,
       129.0
      ],
      "weapon_angle": 170,
      "bbox": [
       113,
       36,
       187,
       256
      ]
     },
     {
      "hand": [
       152.0,
       112.0
      ],
      "tip": [
       108.2,
       22.1
      ],
      "shoulder": [
       138.5,
       131.3
      ],
      "weapon_angle": 206,
      "bbox": [
       100,
       19,
       184,
       256
      ]
     },
     {
      "hand": [
       144.0,
       102.0
      ],
      "tip": [
       65.2,
       40.4
      ],
      "shoulder": [
       132.1,
       134.1
      ],
      "weapon_angle": 232,
      "bbox": [
       62,
       37,
       184,
       256
      ]
     },
     {
      "hand": [
       176.0,
       114.0
      ],
      "tip": [
       226.0,
       27.4
      ],
      "shoulder": [
       158.5,
       133.5
      ],
      "weapon_angle": 150,
      "bbox": [
       107,
       24,
       229,
       256
      ]
     },
     {
      "hand": [
       202.0,
       166.0
      ],
      "tip": [
       300.5,
       183.4
      ],
      "shoulder": [
       182.6,
       144.3
      ],
      "weapon_angle": 80,
      "bbox": [
       114,
       106,
       304,
       256
      ]
     },
     {
      "hand": [
       197.0,
       201.9
      ],
      "tip": [
       275.8,
       263.5
      ],
      "shoulder": [
       188.5,
       150.6
      ],
      "weapon_angle": 52,
      "bbox": [
       113,
       114,
       279,
       267
      ]
     },
     {
      "hand": [
       186.0,
       184.0
      ],
      "tip": [
       277.4,
       224.7
      ],
      "shoulder": [
       174.6,
       142.3
      ],
      "weapon_angle": 66,
      "bbox": [
       115,
       103,
       281,
       263
      ]
     },
     {
      "hand": [
       170.0,
       148.0
      ],
      "tip": [
       234.3,
       71.4
      ],
      "shoulder": [
       155.0,
       131.3
      ],
      "weapon_angle": 140,
      "bbox": [
       105,
       68,
       238,
       256
      ]
     }
    ]
   },
   "thrust": {
    "frames": 6,
    "fps": 13,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       170.0,
       156.0
      ],
      "tip": [
       269.5,
       145.5
      ],
      "shoulder": [
       148.0,
       129.0
      ],
      "weapon_angle": 96,
      "bbox": [
       115,
       87,
       273,
       256
      ]
     },
     {
      "hand": [
       154.0,
       152.0
      ],
      "tip": [
       253.8,
       145.0
      ],
      "shoulder": [
       134.5,
       130.3
      ],
      "weapon_angle": 94,
      "bbox": [
       102,
       88,
       257,
       256
      ]
     },
     {
      "hand": [
       202.0,
       146.0
      ],
      "tip": [
       302.0,
       146.0
      ],
      "shoulder": [
       175.2,
       135.8
      ],
      "weapon_angle": 90,
      "bbox": [
       118,
       96,
       305,
       256
      ]
     },
     {
      "hand": [
       210.0,
       144.0
      ],
      "tip": [
       310.0,
       144.0
      ],
      "shoulder": [
       182.0,
       137.9
      ],
      "weapon_angle": 90,
      "bbox": [
       118,
       99,
       313,
       256
      ]
     },
     {
      "hand": [
       184.0,
       150.0
      ],
      "tip": [
       283.9,
       144.8
      ],
      "shoulder": [
       162.0,
       131.7
      ],
      "weapon_angle": 93,
      "bbox": [
       108,
       91,
       287,
       256
      ]
     },
     {
      "hand": [
       172.0,
       156.0
      ],
      "tip": [
       271.5,
       145.5
      ],
      "shoulder": [
       151.5,
       129.1
      ],
      "weapon_angle": 96,
      "bbox": [
       105,
       88,
       275,
       256
      ]
     }
    ]
   },
   "guard": {
    "frames": 3,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       174.0,
       148.0
      ],
      "tip": [
       260.6,
       98.0
      ],
      "shoulder": [
       149.5,
       133.1
      ],
      "weapon_angle": 120,
      "bbox": [
       110,
       91,
       264,
       256
      ]
     },
     {
      "hand": [
       178.0,
       136.0
      ],
      "tip": [
       275.0,
       111.8
      ],
      "shoulder": [
       150.5,
       137.5
      ],
      "weapon_angle": 104,
      "bbox": [
       108,
       96,
       278,
       256
      ]
     },
     {
      "hand": [
       170.0,
       128.0
      ],
      "tip": [
       248.8,
       66.4
      ],
      "shoulder": [
       138.0,
       135.2
      ],
      "weapon_angle": 128,
      "bbox": [
       104,
       63,
       252,
       256
      ]
     }
    ]
   },
   "hurt": {
    "frames": 4,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       164.0,
       144.0
      ],
      "tip": [
       123.3,
       52.6
      ],
      "shoulder": [
       127.2,
       126.9
      ],
      "weapon_angle": 204,
      "bbox": [
       104,
       49,
       179,
       256
      ]
     },
     {
      "hand": [
       166.0,
       152.0
      ],
      "tip": [
       169.5,
       52.1
      ],
      "shoulder": [
       129.5,
       128.8
      ],
      "weapon_angle": 178,
      "bbox": [
       102,
       49,
       187,
       256
      ]
     },
     {
      "hand": [
       172.0,
       156.0
      ],
      "tip": [
       206.2,
       62.0
      ],
      "shoulder": [
       141.5,
       128.1
      ],
      "weapon_angle": 160,
      "bbox": [
       101,
       59,
       210,
       256
      ]
     },
     {
      "hand": [
       174.0,
       158.0
      ],
      "tip": [
       224.0,
       71.4
      ],
      "shoulder": [
       150.0,
       126.0
      ],
      "weapon_angle": 150,
      "bbox": [
       109,
       68,
       227,
       256
      ]
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       166.0,
       140.0
      ],
      "tip": [
       113.0,
       55.2
      ],
      "shoulder": [
       126.4,
       127.9
      ],
      "weapon_angle": 212,
      "bbox": [
       100,
       52,
       182,
       256
      ]
     },
     {
      "hand": [
       159.9,
       174.8
      ],
      "tip": [
       224.2,
       251.4
      ],
      "shoulder": [
       131.0,
       131.6
      ],
      "weapon_angle": 40,
      "bbox": [
       102,
       89,
       228,
       256
      ]
     },
     {
      "hand": [
       165.5,
       202.1
      ],
      "tip": [
       193.0,
       298.2
      ],
      "shoulder": [
       151.4,
       152.0
      ],
      "weapon_angle": 16,
      "bbox": [
       111,
       113,
       192,
       272
      ]
     },
     {
      "hand": [
       169.7,
       218.7
      ],
      "tip": [
       183.6,
       317.7
      ],
      "shoulder": [
       159.2,
       167.8
      ],
      "weapon_angle": 8,
      "bbox": [
       100,
       133,
       196,
       272
      ]
     },
     {
      "hand": [
       182.0,
       224.0
      ],
      "tip": null,
      "shoulder": [
       179.3,
       188.7
      ],
      "weapon_angle": 150,
      "bbox": [
       94,
       166,
       295,
       272
      ]
     },
     {
      "hand": [
       204.0,
       242.0
      ],
      "tip": null,
      "shoulder": [
       183.1,
       217.2
      ],
      "weapon_angle": 150,
      "bbox": [
       72,
       194,
       295,
       272
      ]
     },
     {
      "hand": [
       216.0,
       247.0
      ],
      "tip": null,
      "shoulder": [
       177.0,
       237.0
      ],
      "weapon_angle": 150,
      "bbox": [
       51,
       211,
       295,
       272
      ]
     },
     {
      "hand": [
       216.0,
       247.0
      ],
      "tip": null,
      "shoulder": [
       177.0,
       237.0
      ],
      "weapon_angle": 150,
      "bbox": [
       51,
       211,
       295,
       272
      ]
     }
    ]
   },
   "salute": {
    "frames": 4,
    "fps": 6,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       165.9,
       175.0
      ],
      "tip": [
       200.1,
       268.9
      ],
      "shoulder": [
       148.5,
       126.0
      ],
      "weapon_angle": 20,
      "bbox": [
       118,
       84,
       203,
       272
      ]
     },
     {
      "hand": [
       174.0,
       166.0
      ],
      "tip": [
       260.6,
       216.0
      ],
      "shoulder": [
       147.0,
       126.0
      ],
      "weapon_angle": 60,
      "bbox": [
       113,
       84,
       264,
       256
      ]
     },
     {
      "hand": [
       170.0,
       120.0
      ],
      "tip": [
       170.0,
       20.0
      ],
      "shoulder": [
       143.0,
       125.2
      ],
      "weapon_angle": 180,
      "bbox": [
       103,
       17,
       191,
       255
      ]
     },
     {
      "hand": [
       190.0,
       138.0
      ],
      "tip": [
       289.5,
       127.5
      ],
      "shoulder": [
       153.5,
       127.1
      ],
      "weapon_angle": 96,
      "bbox": [
       108,
       85,
       293,
       256
      ]
     }
    ]
   },
   "kneel": {
    "frames": 4,
    "fps": 5,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       170.0,
       156.0
      ],
      "tip": [
       220.0,
       69.4
      ],
      "shoulder": [
       134.1,
       134.1
      ],
      "weapon_angle": 150,
      "bbox": [
       111,
       66,
       223,
       256
      ]
     },
     {
      "hand": [
       182.0,
       212.0
      ],
      "tip": [
       281.5,
       201.5
      ],
      "shoulder": [
       151.4,
       170.0
      ],
      "weapon_angle": 96,
      "bbox": [
       99,
       129,
       285,
       266
      ]
     },
     {
      "hand": [
       165.4,
       215.9
      ],
      "tip": null,
      "shoulder": [
       146.5,
       167.5
      ],
      "weapon_angle": 150,
      "bbox": [
       86,
       127,
       299,
       266
      ]
     },
     {
      "hand": [
       160.6,
       213.6
      ],
      "tip": null,
      "shoulder": [
       142.0,
       165.0
      ],
      "weapon_angle": 150,
      "bbox": [
       86,
       123,
       299,
       266
      ]
     }
    ]
   },
   "dodge": {
    "frames": 7,
    "fps": 14,
    "loop": false,
    "per_frame": [
     {
      "hand": [
       180.0,
       198.0
      ],
      "tip": [
       278.5,
       180.6
      ],
      "shoulder": [
       174.0,
       155.4
      ],
      "weapon_angle": 100,
      "bbox": [
       113,
       119,
       282,
       264
      ]
     },
     {
      "hand": [
       164.0,
       218.2
      ],
      "tip": [
       164.0,
       318.2
      ],
      "shoulder": [
       176.5,
       233.8
      ],
      "weapon_angle": 0,
      "bbox": [
       88,
       177,
       211,
       272
      ]
     },
     {
      "hand": [
       141.4,
       212.7
      ],
      "tip": [
       42.9,
       230.1
      ],
      "shoulder": [
       128.3,
       227.7
      ],
      "weapon_angle": 280,
      "bbox": [
       40,
       140,
       179,
       265
      ]
     },
     {
      "hand": [
       142.9,
       189.5
      ],
      "tip": [
       108.7,
       95.5
      ],
      "shoulder": [
       125.9,
       179.2
      ],
      "weapon_angle": 200,
      "bbox": [
       87,
       92,
       213,
       222
      ]
     },
     {
      "hand": [
       166.0,
       186.9
      ],
      "tip": [
       252.6,
       136.9
      ],
      "shoulder": [
       173.3,
       168.4
      ],
      "weapon_angle": 120,
      "bbox": [
       133,
       127,
       256,
       257
      ]
     },
     {
      "hand": [
       184.0,
       192.0
      ],
      "tip": [
       280.1,
       164.4
      ],
      "shoulder": [
       178.5,
       152.6
      ],
      "weapon_angle": 106,
      "bbox": [
       116,
       115,
       283,
       264
      ]
     },
     {
      "hand": [
       176.0,
       166.0
      ],
      "tip": [
       245.5,
       94.1
      ],
      "shoulder": [
       160.9,
       134.4
      ],
      "weapon_angle": 136,
      "bbox": [
       115,
       91,
       249,
       256
      ]
     }
    ]
   }
  }
 },
 "dragon_sunfyre": {
  "base": "sprites/dragon_sunfyre/dragon_sunfyre_base.png",
  "frame_size": [
   768,
   652
  ],
  "res": 1,
  "facing": "left",
  "pivot": [
   384.0,
   626
  ],
  "recommended_scale_1080p": 1.2,
  "sheet_pattern": "sprites/dragon_sunfyre/sheets/dragon_sunfyre_{anim}.png",
  "frames_pattern": "sprites/dragon_sunfyre/frames/{anim}/dragon_sunfyre_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       146.3,
       440.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       412.1
      ],
      "chest": [
       298.0,
       500.0
      ],
      "foreleg": [
       298.3,
       552.2
      ],
      "wing": [
       292.8,
       441.9
      ],
      "tail": [
       517.1,
       516.8
      ],
      "bbox": [
       125,
       182,
       693,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       444.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       412.6
      ],
      "chest": [
       298.0,
       502.2
      ],
      "foreleg": [
       299.9,
       554.1
      ],
      "wing": [
       293.2,
       443.4
      ],
      "tail": [
       516.6,
       520.8
      ],
      "bbox": [
       131,
       179,
       695,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.9,
       444.2
      ],
      "fire_angle": 292.5,
      "head": [
       176.7,
       412.6
      ],
      "chest": [
       298.0,
       502.2
      ],
      "foreleg": [
       299.9,
       554.1
      ],
      "wing": [
       293.2,
       443.4
      ],
      "tail": [
       516.9,
       519.2
      ],
      "bbox": [
       131,
       179,
       692,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.3,
       440.7
      ],
      "fire_angle": 289.2,
      "head": [
       172.3,
       412.1
      ],
      "chest": [
       298.0,
       500.0
      ],
      "foreleg": [
       298.3,
       552.2
      ],
      "wing": [
       292.8,
       441.9
      ],
      "tail": [
       517.6,
       513.6
      ],
      "bbox": [
       125,
       182,
       688,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       439.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       411.8
      ],
      "chest": [
       298.0,
       497.8
      ],
      "foreleg": [
       296.4,
       550.2
      ],
      "wing": [
       292.4,
       440.4
      ],
      "tail": [
       517.8,
       509.6
      ],
      "bbox": [
       120,
       186,
       687,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       439.1
      ],
      "fire_angle": 286.6,
      "head": [
       168.2,
       411.8
      ],
      "chest": [
       298.0,
       497.8
      ],
      "foreleg": [
       296.4,
       550.2
      ],
      "wing": [
       292.4,
       440.4
      ],
      "tail": [
       517.7,
       511.2
      ],
      "bbox": [
       120,
       186,
       690,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       136.5,
       449.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       421.2
      ],
      "chest": [
       296.0,
       504.5
      ],
      "foreleg": [
       291.3,
       557.3
      ],
      "wing": [
       327.2,
       439.2
      ],
      "tail": [
       517.4,
       514.6
      ],
      "bbox": [
       115,
       359,
       696,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       444.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       415.6
      ],
      "chest": [
       296.0,
       502.0
      ],
      "foreleg": [
       292.6,
       554.6
      ],
      "wing": [
       328.1,
       437.2
      ],
      "tail": [
       516.9,
       519.7
      ],
      "bbox": [
       118,
       353,
       698,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.9,
       440.6
      ],
      "fire_angle": 287.6,
      "head": [
       167.5,
       411.9
      ],
      "chest": [
       296.0,
       499.5
      ],
      "foreleg": [
       293.2,
       551.9
      ],
      "wing": [
       329.0,
       435.3
      ],
      "tail": [
       517.0,
       521.9
      ],
      "bbox": [
       120,
       349,
       697,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       139.6,
       444.4
      ],
      "fire_angle": 287.6,
      "head": [
       166.2,
       415.6
      ],
      "chest": [
       296.0,
       502.0
      ],
      "foreleg": [
       298.6,
       553.7
      ],
      "wing": [
       328.1,
       437.2
      ],
      "tail": [
       517.4,
       517.0
      ],
      "bbox": [
       118,
       353,
       694,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.5,
       449.9
      ],
      "fire_angle": 287.6,
      "head": [
       163.1,
       421.2
      ],
      "chest": [
       296.0,
       504.5
      ],
      "foreleg": [
       303.0,
       555.1
      ],
      "wing": [
       327.2,
       439.2
      ],
      "tail": [
       517.8,
       510.7
      ],
      "bbox": [
       115,
       359,
       690,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       450.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       421.8
      ],
      "chest": [
       296.0,
       502.0
      ],
      "foreleg": [
       303.5,
       552.1
      ],
      "wing": [
       328.1,
       437.2
      ],
      "tail": [
       518.0,
       509.5
      ],
      "bbox": [
       112,
       359,
       689,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.4,
       449.4
      ],
      "fire_angle": 287.6,
      "head": [
       159.0,
       420.7
      ],
      "chest": [
       296.0,
       499.5
      ],
      "foreleg": [
       307.6,
       546.8
      ],
      "wing": [
       329.0,
       435.3
      ],
      "tail": [
       518.0,
       511.4
      ],
      "bbox": [
       111,
       358,
       691,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.6,
       450.6
      ],
      "fire_angle": 287.6,
      "head": [
       160.2,
       421.8
      ],
      "chest": [
       296.0,
       502.0
      ],
      "foreleg": [
       302.3,
       552.5
      ],
      "wing": [
       328.1,
       437.2
      ],
      "tail": [
       517.8,
       512.4
      ],
      "bbox": [
       112,
       359,
       693,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       180.4,
       378.7
      ],
      "fire_angle": 264.8,
      "head": [
       215.8,
       364.4
      ],
      "chest": [
       310.0,
       490.0
      ],
      "foreleg": [
       296.1,
       541.3
      ],
      "wing": [
       308.8,
       432.4
      ],
      "tail": [
       519.5,
       515.4
      ],
      "bbox": [
       163,
       169,
       701,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.2,
       349.3
      ],
      "fire_angle": 253.2,
      "head": [
       254.5,
       337.0
      ],
      "chest": [
       320.0,
       480.0
      ],
      "foreleg": [
       304.6,
       530.7
      ],
      "wing": [
       324.9,
       421.7
      ],
      "tail": [
       521.6,
       515.1
      ],
      "bbox": [
       203,
       122,
       705,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       116.9,
       543.8
      ],
      "fire_angle": 311.6,
      "head": [
       110.4,
       487.2
      ],
      "chest": [
       272.0,
       508.0
      ],
      "foreleg": [
       264.5,
       560.6
      ],
      "wing": [
       281.9,
       441.1
      ],
      "tail": [
       505.7,
       525.6
      ],
      "bbox": [
       68,
       240,
       683,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       81.3,
       544.1
      ],
      "fire_angle": 302.8,
      "head": [
       100.4,
       511.0
      ],
      "chest": [
       264.0,
       512.0
      ],
      "foreleg": [
       261.3,
       564.9
      ],
      "wing": [
       282.9,
       443.8
      ],
      "tail": [
       501.7,
       525.9
      ],
      "bbox": [
       59,
       267,
       675,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       97.8,
       515.9
      ],
      "fire_angle": 300.0,
      "head": [
       114.8,
       477.2
      ],
      "chest": [
       274.0,
       508.0
      ],
      "foreleg": [
       273.3,
       560.6
      ],
      "wing": [
       266.7,
       449.9
      ],
      "tail": [
       507.0,
       519.9
      ],
      "bbox": [
       71,
       213,
       678,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.7,
       457.5
      ],
      "fire_angle": 291.6,
      "head": [
       157.2,
       427.0
      ],
      "chest": [
       294.0,
       502.0
      ],
      "foreleg": [
       297.4,
       553.6
      ],
      "wing": [
       287.7,
       444.5
      ],
      "tail": [
       515.7,
       513.9
      ],
      "bbox": [
       111,
       208,
       685,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       377.9
      ],
      "fire_angle": 261.6,
      "head": [
       211.4,
       363.7
      ],
      "chest": [
       306.0,
       492.0
      ],
      "foreleg": [
       293.3,
       543.6
      ],
      "wing": [
       305.0,
       433.6
      ],
      "tail": [
       519.6,
       515.1
      ],
      "bbox": [
       158,
       163,
       701,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       221.2,
       339.9
      ],
      "fire_angle": 246.0,
      "head": [
       262.5,
       331.0
      ],
      "chest": [
       318.0,
       480.0
      ],
      "foreleg": [
       301.6,
       530.5
      ],
      "wing": [
       322.9,
       421.6
      ],
      "tail": [
       521.6,
       514.9
      ],
      "bbox": [
       205,
       122,
       705,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.9,
       482.5
      ],
      "fire_angle": 292.4,
      "head": [
       133.8,
       433.2
      ],
      "chest": [
       282.0,
       500.0
      ],
      "foreleg": [
       287.8,
       550.6
      ],
      "wing": [
       279.3,
       440.4
      ],
      "tail": [
       510.4,
       522.6
      ],
      "bbox": [
       84,
       170,
       690,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       108.2,
       517.0
      ],
      "fire_angle": 298.8,
      "head": [
       115.4,
       461.8
      ],
      "chest": [
       274.0,
       504.0
      ],
      "foreleg": [
       284.8,
       552.6
      ],
      "wing": [
       268.9,
       445.1
      ],
      "tail": [
       508.1,
       524.1
      ],
      "bbox": [
       67,
       191,
       684,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       109.2,
       514.2
      ],
      "fire_angle": 297.7,
      "head": [
       116.6,
       457.9
      ],
      "chest": [
       274.0,
       504.9
      ],
      "foreleg": [
       285.5,
       553.3
      ],
      "wing": [
       269.1,
       445.7
      ],
      "tail": [
       508.7,
       521.6
      ],
      "bbox": [
       68,
       188,
       682,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.5,
       518.8
      ],
      "fire_angle": 299.5,
      "head": [
       114.7,
       464.4
      ],
      "chest": [
       274.0,
       503.4
      ],
      "foreleg": [
       284.4,
       552.1
      ],
      "wing": [
       268.9,
       444.7
      ],
      "tail": [
       509.2,
       518.3
      ],
      "bbox": [
       67,
       193,
       679,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.6,
       518.6
      ],
      "fire_angle": 299.5,
      "head": [
       114.8,
       464.1
      ],
      "chest": [
       274.0,
       503.4
      ],
      "foreleg": [
       284.5,
       552.2
      ],
      "wing": [
       268.9,
       444.7
      ],
      "tail": [
       509.6,
       515.4
      ],
      "bbox": [
       67,
       193,
       676,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       129.5,
       459.5
      ],
      "fire_angle": 291.2,
      "head": [
       153.0,
       425.7
      ],
      "chest": [
       290.0,
       502.0
      ],
      "foreleg": [
       294.9,
       553.1
      ],
      "wing": [
       283.7,
       444.5
      ],
      "tail": [
       515.8,
       511.6
      ],
      "bbox": [
       106,
       208,
       685,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       254.4,
       333.6
      ],
      "fire_angle": 230.4,
      "head": [
       305.4,
       324.5
      ],
      "chest": [
       322.0,
       484.0
      ],
      "foreleg": [
       304.9,
       534.3
      ],
      "wing": [
       326.2,
       425.0
      ],
      "tail": [
       523.8,
       510.6
      ],
      "bbox": [
       241,
       131,
       709,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       235.8,
       348.6
      ],
      "fire_angle": 241.2,
      "head": [
       281.2,
       336.6
      ],
      "chest": [
       328.0,
       490.0
      ],
      "foreleg": [
       315.0,
       541.4
      ],
      "wing": [
       327.7,
       432.2
      ],
      "tail": [
       527.7,
       513.9
      ],
      "bbox": [
       227,
       162,
       712,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.9,
       393.5
      ],
      "fire_angle": 267.2,
      "head": [
       219.1,
       372.1
      ],
      "chest": [
       316.0,
       496.0
      ],
      "foreleg": [
       310.9,
       548.4
      ],
      "wing": [
       311.0,
       439.4
      ],
      "tail": [
       523.5,
       515.5
      ],
      "bbox": [
       167,
       202,
       704,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.5,
       434.5
      ],
      "fire_angle": 285.6,
      "head": [
       179.0,
       406.7
      ],
      "chest": [
       302.0,
       500.0
      ],
      "foreleg": [
       300.6,
       552.4
      ],
      "wing": [
       295.9,
       442.7
      ],
      "tail": [
       519.3,
       516.0
      ],
      "bbox": [
       130,
       206,
       692,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       360.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       340.6
      ],
      "chest": [
       292.0,
       416.0
      ],
      "foreleg": [
       296.8,
       466.2
      ],
      "wing": [
       294.2,
       355.3
      ],
      "tail": [
       511.9,
       432.7
      ],
      "bbox": [
       91,
       62,
       697,
       523
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       363.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       343.6
      ],
      "chest": [
       292.0,
       418.9
      ],
      "foreleg": [
       296.9,
       469.1
      ],
      "wing": [
       305.2,
       353.9
      ],
      "tail": [
       511.8,
       438.7
      ],
      "bbox": [
       91,
       62,
       698,
       526
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       370.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       350.6
      ],
      "chest": [
       292.0,
       426.0
      ],
      "foreleg": [
       297.0,
       476.3
      ],
      "wing": [
       332.7,
       365.7
      ],
      "tail": [
       511.8,
       444.5
      ],
      "bbox": [
       91,
       137,
       698,
       531
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       378.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       357.7
      ],
      "chest": [
       292.0,
       433.1
      ],
      "foreleg": [
       297.1,
       483.5
      ],
      "wing": [
       350.2,
       402.8
      ],
      "tail": [
       512.0,
       446.7
      ],
      "bbox": [
       91,
       312,
       696,
       620
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       380.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       360.6
      ],
      "chest": [
       292.0,
       436.0
      ],
      "foreleg": [
       297.1,
       486.4
      ],
      "wing": [
       347.9,
       420.5
      ],
      "tail": [
       511.9,
       444.1
      ],
      "bbox": [
       91,
       315,
       694,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       378.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       357.7
      ],
      "chest": [
       292.0,
       433.1
      ],
      "foreleg": [
       297.1,
       483.5
      ],
      "wing": [
       350.2,
       402.8
      ],
      "tail": [
       511.6,
       438.1
      ],
      "bbox": [
       91,
       312,
       694,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       370.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       350.6
      ],
      "chest": [
       292.0,
       426.0
      ],
      "foreleg": [
       297.0,
       476.3
      ],
      "wing": [
       332.7,
       365.7
      ],
      "tail": [
       511.6,
       432.3
      ],
      "bbox": [
       91,
       256,
       695,
       531
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       363.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       343.6
      ],
      "chest": [
       292.0,
       418.9
      ],
      "foreleg": [
       296.9,
       469.1
      ],
      "wing": [
       305.2,
       353.9
      ],
      "tail": [
       511.8,
       430.0
      ],
      "bbox": [
       91,
       98,
       696,
       526
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       244.1,
       340.5
      ],
      "fire_angle": 235.2,
      "head": [
       295.0,
       325.6
      ],
      "chest": [
       318.0,
       484.0
      ],
      "foreleg": [
       301.8,
       534.6
      ],
      "wing": [
       322.1,
       424.9
      ],
      "tail": [
       521.8,
       510.6
      ],
      "bbox": [
       235,
       131,
       707,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       279.7,
       306.0
      ],
      "fire_angle": 223.6,
      "head": [
       335.9,
       297.5
      ],
      "chest": [
       332.0,
       458.0
      ],
      "foreleg": [
       313.6,
       507.1
      ],
      "wing": [
       340.7,
       403.8
      ],
      "tail": [
       525.9,
       508.8
      ],
      "bbox": [
       262,
       104,
       711,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.3,
       365.6
      ],
      "fire_angle": 249.6,
      "head": [
       256.0,
       341.9
      ],
      "chest": [
       324.0,
       490.0
      ],
      "foreleg": [
       314.5,
       541.9
      ],
      "wing": [
       351.1,
       425.6
      ],
      "tail": [
       523.5,
       518.4
      ],
      "bbox": [
       202,
       219,
       706,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.1,
       485.4
      ],
      "fire_angle": 276.4,
      "head": [
       162.6,
       451.3
      ],
      "chest": [
       308.0,
       532.0
      ],
      "foreleg": [
       312.2,
       583.7
      ],
      "wing": [
       346.0,
       469.9
      ],
      "tail": [
       518.6,
       545.8
      ],
      "bbox": [
       111,
       237,
       694,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       106.9,
       590.1
      ],
      "fire_angle": 284.0,
      "head": [
       134.0,
       557.6
      ],
      "chest": [
       300.0,
       568.0
      ],
      "foreleg": [
       297.4,
       620.9
      ],
      "wing": [
       350.9,
       520.5
      ],
      "tail": [
       518.2,
       579.8
      ],
      "bbox": [
       84,
       273,
       690,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.2,
       617.3
      ],
      "fire_angle": 278.4,
      "head": [
       128.8,
       591.3
      ],
      "chest": [
       296.0,
       588.0
      ],
      "foreleg": [
       281.1,
       638.8
      ],
      "wing": [
       351.3,
       555.5
      ],
      "tail": [
       517.3,
       605.2
      ],
      "bbox": [
       78,
       410,
       673,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.6,
       613.2
      ],
      "fire_angle": 269.6,
      "head": [
       126.7,
       594.1
      ],
      "chest": [
       294.0,
       592.0
      ],
      "foreleg": [
       276.9,
       641.8
      ],
      "wing": [
       349.0,
       567.2
      ],
      "tail": [
       516.6,
       611.4
      ],
      "bbox": [
       75,
       414,
       658,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       92.2,
       612.5
      ],
      "fire_angle": 267.2,
      "head": [
       127.0,
       595.8
      ],
      "chest": [
       294.0,
       594.0
      ],
      "foreleg": [
       276.1,
       643.4
      ],
      "wing": [
       347.1,
       576.7
      ],
      "tail": [
       516.6,
       613.5
      ],
      "bbox": [
       75,
       416,
       658,
       652
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       178.5,
       373.5
      ],
      "fire_angle": 258.4,
      "head": [
       216.1,
       359.6
      ],
      "chest": [
       306.0,
       492.0
      ],
      "foreleg": [
       293.3,
       543.6
      ],
      "wing": [
       305.0,
       433.6
      ],
      "tail": [
       519.6,
       515.1
      ],
      "bbox": [
       162,
       163,
       701,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       91.4,
       527.4
      ],
      "fire_angle": 279.6,
      "head": [
       120.3,
       493.4
      ],
      "chest": [
       288.0,
       508.0
      ],
      "foreleg": [
       271.0,
       557.9
      ],
      "wing": [
       280.7,
       449.9
      ],
      "tail": [
       514.5,
       522.1
      ],
      "bbox": [
       68,
       213,
       694,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       88.9,
       608.2
      ],
      "fire_angle": 276.0,
      "head": [
       117.3,
       561.8
      ],
      "chest": [
       270.0,
       520.0
      ],
      "foreleg": [
       262.2,
       572.6
      ],
      "wing": [
       273.1,
       453.3
      ],
      "tail": [
       509.9,
       524.9
      ],
      "bbox": [
       63,
       241,
       687,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       84.2,
       599.4
      ],
      "fire_angle": 273.8,
      "head": [
       114.0,
       552.5
      ],
      "chest": [
       270.0,
       520.0
      ],
      "foreleg": [
       262.2,
       572.6
      ],
      "wing": [
       273.1,
       453.3
      ],
      "tail": [
       510.3,
       523.4
      ],
      "bbox": [
       59,
       241,
       685,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       90.2,
       610.4
      ],
      "fire_angle": 276.6,
      "head": [
       118.3,
       564.2
      ],
      "chest": [
       270.0,
       520.0
      ],
      "foreleg": [
       262.2,
       572.6
      ],
      "wing": [
       273.1,
       453.3
      ],
      "tail": [
       510.9,
       520.5
      ],
      "bbox": [
       64,
       241,
       683,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       93.8,
       616.0
      ],
      "fire_angle": 278.0,
      "head": [
       121.0,
       570.3
      ],
      "chest": [
       270.0,
       520.0
      ],
      "foreleg": [
       262.2,
       572.6
      ],
      "wing": [
       273.1,
       453.3
      ],
      "tail": [
       511.4,
       517.2
      ],
      "bbox": [
       67,
       241,
       680,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       115.2,
       468.5
      ],
      "fire_angle": 286.4,
      "head": [
       141.9,
       438.5
      ],
      "chest": [
       290.0,
       504.0
      ],
      "foreleg": [
       296.3,
       554.8
      ],
      "wing": [
       283.3,
       446.3
      ],
      "tail": [
       515.8,
       511.8
      ],
      "bbox": [
       93,
       209,
       685,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       125.5,
       502.2
      ],
      "fire_angle": 275.6,
      "head": [
       157.5,
       479.6
      ],
      "chest": [
       320.0,
       528.0
      ],
      "foreleg": [
       330.6,
       579.4
      ],
      "wing": [
       344.7,
       459.5
      ],
      "tail": [
       519.9,
       500.5
      ],
      "bbox": [
       106,
       406,
       706,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       514.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       486.5
      ],
      "chest": [
       268.0,
       516.0
      ],
      "foreleg": [
       285.3,
       562.9
      ],
      "wing": [
       296.9,
       449.2
      ],
      "tail": [
       498.0,
       495.9
      ],
      "bbox": [
       49,
       394,
       684,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       508.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       480.5
      ],
      "chest": [
       268.0,
       510.0
      ],
      "foreleg": [
       248.6,
       558.0
      ],
      "wing": [
       298.9,
       444.1
      ],
      "tail": [
       497.9,
       502.6
      ],
      "bbox": [
       49,
       389,
       684,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       502.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       474.5
      ],
      "chest": [
       268.0,
       504.0
      ],
      "foreleg": [
       271.2,
       556.0
      ],
      "wing": [
       300.8,
       439.2
      ],
      "tail": [
       497.9,
       500.6
      ],
      "bbox": [
       49,
       384,
       682,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       69.4,
       508.9
      ],
      "fire_angle": 276.0,
      "head": [
       100.7,
       480.5
      ],
      "chest": [
       268.0,
       510.0
      ],
      "foreleg": [
       286.3,
       554.8
      ],
      "wing": [
       298.9,
       444.1
      ],
      "tail": [
       497.7,
       493.9
      ],
      "bbox": [
       49,
       389,
       682,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.4,
       473.7
      ],
      "fire_angle": 285.2,
      "head": [
       156.3,
       442.4
      ],
      "chest": [
       296.0,
       522.0
      ],
      "foreleg": [
       270.8,
       564.8
      ],
      "wing": [
       304.4,
       453.6
      ],
      "tail": [
       520.9,
       522.1
      ],
      "bbox": [
       107,
       361,
       702,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "breath_level": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       174.9,
       372.8
      ],
      "fire_angle": 257.6,
      "head": [
       212.3,
       361.2
      ],
      "chest": [
       306.0,
       492.0
      ],
      "foreleg": [
       293.3,
       543.6
      ],
      "wing": [
       305.0,
       433.6
      ],
      "tail": [
       519.6,
       515.1
      ],
      "bbox": [
       159,
       163,
       701,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       211.6,
       347.9
      ],
      "fire_angle": 248.0,
      "head": [
       252.6,
       337.5
      ],
      "chest": [
       316.0,
       484.0
      ],
      "foreleg": [
       300.3,
       534.7
      ],
      "wing": [
       320.0,
       424.8
      ],
      "tail": [
       521.6,
       514.9
      ],
      "bbox": [
       195,
       125,
       705,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       98.8,
       479.0
      ],
      "fire_angle": 277.6,
      "head": [
       127.2,
       437.1
      ],
      "chest": [
       284.0,
       502.0
      ],
      "foreleg": [
       290.7,
       552.4
      ],
      "wing": [
       280.9,
       442.1
      ],
      "tail": [
       512.4,
       522.6
      ],
      "bbox": [
       74,
       172,
       692,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       89.6,
       498.7
      ],
      "fire_angle": 280.0,
      "head": [
       114.8,
       450.5
      ],
      "chest": [
       276.0,
       506.0
      ],
      "foreleg": [
       287.6,
       554.3
      ],
      "wing": [
       270.9,
       446.6
      ],
      "tail": [
       508.1,
       524.1
      ],
      "bbox": [
       61,
       189,
       684,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       91.5,
       496.9
      ],
      "fire_angle": 279.8,
      "head": [
       116.3,
       447.1
      ],
      "chest": [
       276.0,
       506.9
      ],
      "foreleg": [
       288.2,
       555.0
      ],
      "wing": [
       270.7,
       447.4
      ],
      "tail": [
       508.7,
       521.6
      ],
      "bbox": [
       62,
       190,
       682,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.5,
       500.0
      ],
      "fire_angle": 280.1,
      "head": [
       113.9,
       452.7
      ],
      "chest": [
       276.0,
       505.4
      ],
      "foreleg": [
       287.2,
       553.9
      ],
      "wing": [
       271.0,
       446.1
      ],
      "tail": [
       509.2,
       518.3
      ],
      "bbox": [
       60,
       189,
       679,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       88.6,
       499.8
      ],
      "fire_angle": 280.1,
      "head": [
       114.0,
       452.5
      ],
      "chest": [
       276.0,
       505.4
      ],
      "foreleg": [
       287.3,
       553.9
      ],
      "wing": [
       271.0,
       446.1
      ],
      "tail": [
       509.6,
       515.4
      ],
      "bbox": [
       60,
       189,
       676,
       638
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       130.1,
       457.4
      ],
      "fire_angle": 289.2,
      "head": [
       154.7,
       424.3
      ],
      "chest": [
       292.0,
       502.0
      ],
      "foreleg": [
       296.2,
       553.4
      ],
      "wing": [
       285.7,
       444.5
      ],
      "tail": [
       515.8,
       511.6
      ],
      "bbox": [
       107,
       208,
       685,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight_strike": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       110.4,
       360.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       340.6
      ],
      "chest": [
       292.0,
       416.0
      ],
      "foreleg": [
       296.8,
       466.2
      ],
      "wing": [
       294.2,
       355.3
      ],
      "tail": [
       511.9,
       432.7
      ],
      "bbox": [
       91,
       62,
       697,
       523
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       363.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       343.6
      ],
      "chest": [
       292.0,
       418.9
      ],
      "foreleg": [
       296.9,
       469.1
      ],
      "wing": [
       305.2,
       353.9
      ],
      "tail": [
       511.8,
       438.7
      ],
      "bbox": [
       91,
       62,
       698,
       526
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       370.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       350.6
      ],
      "chest": [
       292.0,
       426.0
      ],
      "foreleg": [
       297.0,
       476.3
      ],
      "wing": [
       332.7,
       365.7
      ],
      "tail": [
       511.8,
       444.5
      ],
      "bbox": [
       91,
       137,
       698,
       531
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       378.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       357.7
      ],
      "chest": [
       292.0,
       433.1
      ],
      "foreleg": [
       297.1,
       483.5
      ],
      "wing": [
       350.2,
       402.8
      ],
      "tail": [
       512.0,
       446.7
      ],
      "bbox": [
       91,
       312,
       696,
       620
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       380.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       360.6
      ],
      "chest": [
       292.0,
       436.0
      ],
      "foreleg": [
       297.1,
       486.4
      ],
      "wing": [
       347.9,
       420.5
      ],
      "tail": [
       511.9,
       444.1
      ],
      "bbox": [
       91,
       315,
       694,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       378.0
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       357.7
      ],
      "chest": [
       292.0,
       433.1
      ],
      "foreleg": [
       297.1,
       483.5
      ],
      "wing": [
       350.2,
       402.8
      ],
      "tail": [
       511.6,
       438.1
      ],
      "bbox": [
       91,
       312,
       694,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       370.9
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       350.6
      ],
      "chest": [
       292.0,
       426.0
      ],
      "foreleg": [
       297.0,
       476.3
      ],
      "wing": [
       332.7,
       365.7
      ],
      "tail": [
       511.6,
       432.3
      ],
      "bbox": [
       91,
       256,
       695,
       531
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       110.4,
       363.8
      ],
      "fire_angle": 274.8,
      "head": [
       142.8,
       343.6
      ],
      "chest": [
       292.0,
       418.9
      ],
      "foreleg": [
       296.9,
       469.1
      ],
      "wing": [
       305.2,
       353.9
      ],
      "tail": [
       511.8,
       430.0
      ],
      "bbox": [
       91,
       98,
       696,
       526
      ],
      "breathing_fire": false
     }
    ]
   },
   "wingspread": {
    "frames": 7,
    "fps": 9,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       194.9,
       363.9
      ],
      "fire_angle": 259.2,
      "head": [
       232.7,
       347.6
      ],
      "chest": [
       312.0,
       484.0
      ],
      "foreleg": [
       297.1,
       534.9
      ],
      "wing": [
       316.3,
       425.1
      ],
      "tail": [
       519.6,
       516.7
      ],
      "bbox": [
       180,
       125,
       701,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       242.3,
       328.0
      ],
      "fire_angle": 242.4,
      "head": [
       286.7,
       316.7
      ],
      "chest": [
       324.0,
       470.0
      ],
      "foreleg": [
       305.2,
       519.4
      ],
      "wing": [
       331.6,
       414.4
      ],
      "tail": [
       521.6,
       518.4
      ],
      "bbox": [
       233,
       111,
       705,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.7,
       431.9
      ],
      "fire_angle": 276.8,
      "head": [
       166.0,
       392.2
      ],
      "chest": [
       298.0,
       490.0
      ],
      "foreleg": [
       287.2,
       541.8
      ],
      "wing": [
       355.3,
       475.6
      ],
      "tail": [
       516.9,
       522.1
      ],
      "bbox": [
       114,
       355,
       698,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.7,
       434.9
      ],
      "fire_angle": 276.8,
      "head": [
       166.0,
       395.2
      ],
      "chest": [
       298.0,
       493.0
      ],
      "foreleg": [
       287.3,
       544.9
      ],
      "wing": [
       339.3,
       433.2
      ],
      "tail": [
       517.0,
       521.8
      ],
      "bbox": [
       114,
       231,
       697,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.7,
       431.9
      ],
      "fire_angle": 276.8,
      "head": [
       166.0,
       392.2
      ],
      "chest": [
       298.0,
       490.0
      ],
      "foreleg": [
       287.2,
       541.8
      ],
      "wing": [
       355.3,
       475.6
      ],
      "tail": [
       517.3,
       519.7
      ],
      "bbox": [
       114,
       355,
       695,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       136.7,
       434.9
      ],
      "fire_angle": 276.8,
      "head": [
       166.0,
       395.2
      ],
      "chest": [
       298.0,
       493.0
      ],
      "foreleg": [
       287.3,
       544.9
      ],
      "wing": [
       339.3,
       433.2
      ],
      "tail": [
       517.7,
       516.5
      ],
      "bbox": [
       114,
       231,
       692,
       637
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.1,
       453.2
      ],
      "fire_angle": 288.4,
      "head": [
       158.7,
       422.3
      ],
      "chest": [
       296.0,
       500.0
      ],
      "foreleg": [
       297.1,
       552.0
      ],
      "wing": [
       290.1,
       442.8
      ],
      "tail": [
       515.7,
       513.5
      ],
      "bbox": [
       111,
       206,
       685,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_low": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       137.8,
       460.4
      ],
      "fire_angle": 287.6,
      "head": [
       164.3,
       431.6
      ],
      "chest": [
       300.0,
       512.0
      ],
      "foreleg": [
       307.4,
       563.4
      ],
      "wing": [
       290.7,
       452.8
      ],
      "tail": [
       517.2,
       482.8
      ],
      "bbox": [
       116,
       216,
       700,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.8,
       474.9
      ],
      "fire_angle": 289.6,
      "head": [
       155.3,
       445.2
      ],
      "chest": [
       296.0,
       518.0
      ],
      "foreleg": [
       308.0,
       568.2
      ],
      "wing": [
       284.7,
       457.9
      ],
      "tail": [
       514.1,
       465.9
      ],
      "bbox": [
       108,
       221,
       687,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.0,
       470.6
      ],
      "fire_angle": 289.6,
      "head": [
       158.6,
       441.0
      ],
      "chest": [
       294.0,
       520.0
      ],
      "foreleg": [
       306.5,
       569.1
      ],
      "wing": [
       330.1,
       456.9
      ],
      "tail": [
       519.0,
       521.8
      ],
      "bbox": [
       111,
       341,
       704,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       131.0,
       472.6
      ],
      "fire_angle": 289.6,
      "head": [
       156.6,
       443.0
      ],
      "chest": [
       292.0,
       522.0
      ],
      "foreleg": [
       305.6,
       570.2
      ],
      "wing": [
       328.5,
       459.1
      ],
      "tail": [
       512.5,
       535.8
      ],
      "bbox": [
       109,
       343,
       692,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       131.0,
       470.6
      ],
      "fire_angle": 289.6,
      "head": [
       156.6,
       441.0
      ],
      "chest": [
       292.0,
       520.0
      ],
      "foreleg": [
       304.9,
       568.5
      ],
      "wing": [
       283.5,
       461.2
      ],
      "tail": [
       512.1,
       537.1
      ],
      "bbox": [
       109,
       224,
       690,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.2,
       455.0
      ],
      "fire_angle": 287.6,
      "head": [
       158.7,
       426.3
      ],
      "chest": [
       296.0,
       504.0
      ],
      "foreleg": [
       299.9,
       555.5
      ],
      "wing": [
       289.5,
       446.4
      ],
      "tail": [
       517.5,
       516.1
      ],
      "bbox": [
       111,
       209,
       690,
       638
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_high": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       137.8,
       454.4
      ],
      "fire_angle": 287.6,
      "head": [
       164.3,
       425.6
      ],
      "chest": [
       300.0,
       506.0
      ],
      "foreleg": [
       303.4,
       557.6
      ],
      "wing": [
       293.5,
       448.4
      ],
      "tail": [
       513.4,
       539.6
      ],
      "bbox": [
       116,
       211,
       676,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       131.8,
       466.9
      ],
      "fire_angle": 289.6,
      "head": [
       157.3,
       437.2
      ],
      "chest": [
       298.0,
       510.0
      ],
      "foreleg": [
       304.3,
       560.9
      ],
      "wing": [
       291.1,
       452.1
      ],
      "tail": [
       509.3,
       552.0
      ],
      "bbox": [
       110,
       215,
       657,
       652
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       133.0,
       458.6
      ],
      "fire_angle": 289.6,
      "head": [
       158.6,
       429.0
      ],
      "chest": [
       294.0,
       508.0
      ],
      "foreleg": [
       301.7,
       559.0
      ],
      "wing": [
       330.8,
       445.3
      ],
      "tail": [
       517.9,
       498.4
      ],
      "bbox": [
       111,
       329,
       697,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       131.0,
       456.6
      ],
      "fire_angle": 289.6,
      "head": [
       156.6,
       427.0
      ],
      "chest": [
       292.0,
       506.0
      ],
      "foreleg": [
       299.7,
       557.1
      ],
      "wing": [
       328.5,
       443.1
      ],
      "tail": [
       515.0,
       486.4
      ],
      "bbox": [
       109,
       327,
       695,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       131.0,
       456.6
      ],
      "fire_angle": 289.6,
      "head": [
       156.6,
       427.0
      ],
      "chest": [
       292.0,
       506.0
      ],
      "foreleg": [
       299.7,
       557.1
      ],
      "wing": [
       283.1,
       447.0
      ],
      "tail": [
       513.7,
       480.2
      ],
      "bbox": [
       109,
       210,
       692,
       638
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       132.2,
       455.0
      ],
      "fire_angle": 287.6,
      "head": [
       158.7,
       426.3
      ],
      "chest": [
       296.0,
       504.0
      ],
      "foreleg": [
       299.9,
       555.5
      ],
      "wing": [
       289.5,
       446.4
      ],
      "tail": [
       517.5,
       516.1
      ],
      "bbox": [
       111,
       209,
       690,
       638
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "dragon_vermithor": {
  "base": "sprites/dragon_vermithor/dragon_vermithor_base.png",
  "frame_size": [
   922,
   782
  ],
  "res": 1.2,
  "facing": "left",
  "pivot": [
   461.0,
   751.1999999999999
  ],
  "recommended_scale_1080p": 1.3,
  "sheet_pattern": "sprites/dragon_vermithor/sheets/dragon_vermithor_{anim}.png",
  "frames_pattern": "sprites/dragon_vermithor/frames/{anim}/dragon_vermithor_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       170.9,
       531.7
      ],
      "fire_angle": 289.2,
      "head": [
       204.0,
       495.3
      ],
      "chest": [
       357.8,
       600.3
      ],
      "foreleg": [
       358.2,
       662.9
      ],
      "wing": [
       353.7,
       533.0
      ],
      "tail": [
       620.7,
       620.5
      ],
      "bbox": [
       145,
       261,
       832,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       179.0,
       536.2
      ],
      "fire_angle": 292.5,
      "head": [
       209.3,
       496.0
      ],
      "chest": [
       357.8,
       602.9
      ],
      "foreleg": [
       360.1,
       665.2
      ],
      "wing": [
       354.1,
       534.9
      ],
      "tail": [
       620.2,
       625.2
      ],
      "bbox": [
       151,
       257,
       833,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       179.0,
       536.2
      ],
      "fire_angle": 292.5,
      "head": [
       209.3,
       496.0
      ],
      "chest": [
       357.8,
       602.9
      ],
      "foreleg": [
       360.1,
       665.2
      ],
      "wing": [
       354.1,
       534.9
      ],
      "tail": [
       620.6,
       623.3
      ],
      "bbox": [
       151,
       257,
       830,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       170.9,
       531.7
      ],
      "fire_angle": 289.2,
      "head": [
       204.0,
       495.3
      ],
      "chest": [
       357.8,
       600.3
      ],
      "foreleg": [
       358.2,
       662.9
      ],
      "wing": [
       353.7,
       533.0
      ],
      "tail": [
       621.4,
       616.5
      ],
      "bbox": [
       145,
       261,
       825,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.2,
       529.6
      ],
      "fire_angle": 286.6,
      "head": [
       199.0,
       494.7
      ],
      "chest": [
       357.8,
       597.7
      ],
      "foreleg": [
       355.9,
       660.6
      ],
      "wing": [
       353.2,
       531.2
      ],
      "tail": [
       621.7,
       611.7
      ],
      "bbox": [
       139,
       265,
       824,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.2,
       529.6
      ],
      "fire_angle": 286.6,
      "head": [
       199.0,
       494.7
      ],
      "chest": [
       357.8,
       597.7
      ],
      "foreleg": [
       355.9,
       660.6
      ],
      "wing": [
       353.2,
       531.2
      ],
      "tail": [
       621.5,
       613.7
      ],
      "bbox": [
       139,
       265,
       827,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       159.1,
       542.7
      ],
      "fire_angle": 287.6,
      "head": [
       192.9,
       506.0
      ],
      "chest": [
       355.4,
       605.7
      ],
      "foreleg": [
       349.7,
       669.0
      ],
      "wing": [
       391.7,
       530.4
      ],
      "tail": [
       621.1,
       617.8
      ],
      "bbox": [
       133,
       405,
       835,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       162.8,
       536.0
      ],
      "fire_angle": 287.6,
      "head": [
       196.6,
       499.4
      ],
      "chest": [
       355.4,
       602.7
      ],
      "foreleg": [
       351.2,
       665.8
      ],
      "wing": [
       392.7,
       528.0
      ],
      "tail": [
       620.6,
       623.9
      ],
      "bbox": [
       136,
       398,
       837,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       164.3,
       531.5
      ],
      "fire_angle": 287.6,
      "head": [
       198.2,
       494.9
      ],
      "chest": [
       355.4,
       599.7
      ],
      "foreleg": [
       351.9,
       662.5
      ],
      "wing": [
       393.8,
       525.7
      ],
      "tail": [
       620.6,
       626.5
      ],
      "bbox": [
       138,
       393,
       836,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       162.8,
       536.0
      ],
      "fire_angle": 287.6,
      "head": [
       196.6,
       499.4
      ],
      "chest": [
       355.4,
       602.7
      ],
      "foreleg": [
       358.4,
       664.7
      ],
      "wing": [
       392.7,
       528.0
      ],
      "tail": [
       621.2,
       620.6
      ],
      "bbox": [
       136,
       398,
       832,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.1,
       542.7
      ],
      "fire_angle": 287.6,
      "head": [
       192.9,
       506.0
      ],
      "chest": [
       355.4,
       605.7
      ],
      "foreleg": [
       363.8,
       666.4
      ],
      "wing": [
       391.7,
       530.4
      ],
      "tail": [
       621.7,
       613.1
      ],
      "bbox": [
       133,
       405,
       828,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.6,
       543.5
      ],
      "fire_angle": 287.6,
      "head": [
       189.4,
       506.8
      ],
      "chest": [
       355.4,
       602.7
      ],
      "foreleg": [
       364.3,
       662.8
      ],
      "wing": [
       392.7,
       528.0
      ],
      "tail": [
       621.8,
       611.7
      ],
      "bbox": [
       129,
       405,
       827,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       154.1,
       542.1
      ],
      "fire_angle": 287.6,
      "head": [
       188.0,
       505.4
      ],
      "chest": [
       355.4,
       599.7
      ],
      "foreleg": [
       369.3,
       656.4
      ],
      "wing": [
       393.8,
       525.7
      ],
      "tail": [
       621.8,
       614.0
      ],
      "bbox": [
       128,
       404,
       828,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.6,
       543.5
      ],
      "fire_angle": 287.6,
      "head": [
       189.4,
       506.8
      ],
      "chest": [
       355.4,
       602.7
      ],
      "foreleg": [
       362.9,
       663.3
      ],
      "wing": [
       392.7,
       528.0
      ],
      "tail": [
       621.6,
       615.1
      ],
      "bbox": [
       129,
       405,
       832,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       211.1,
       455.0
      ],
      "fire_angle": 264.8,
      "head": [
       256.2,
       436.8
      ],
      "chest": [
       372.2,
       588.3
      ],
      "foreleg": [
       355.5,
       649.8
      ],
      "wing": [
       372.8,
       521.8
      ],
      "tail": [
       623.7,
       618.8
      ],
      "bbox": [
       190,
       245,
       841,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       252.9,
       418.9
      ],
      "fire_angle": 253.2,
      "head": [
       303.0,
       403.3
      ],
      "chest": [
       384.2,
       576.2
      ],
      "foreleg": [
       365.7,
       637.1
      ],
      "wing": [
       391.8,
       509.1
      ],
      "tail": [
       626.1,
       618.4
      ],
      "bbox": [
       238,
       195,
       846,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       138.1,
       658.0
      ],
      "fire_angle": 311.6,
      "head": [
       129.8,
       585.9
      ],
      "chest": [
       326.5,
       609.9
      ],
      "foreleg": [
       317.5,
       673.0
      ],
      "wing": [
       339.1,
       532.8
      ],
      "tail": [
       607.1,
       631.0
      ],
      "bbox": [
       76,
       320,
       819,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       93.6,
       656.8
      ],
      "fire_angle": 302.8,
      "head": [
       117.9,
       614.7
      ],
      "chest": [
       316.9,
       614.7
      ],
      "foreleg": [
       313.7,
       678.1
      ],
      "wing": [
       339.5,
       536.2
      ],
      "tail": [
       602.3,
       631.4
      ],
      "bbox": [
       67,
       349,
       810,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       113.3,
       623.1
      ],
      "fire_angle": 300.0,
      "head": [
       135.1,
       573.8
      ],
      "chest": [
       328.9,
       609.9
      ],
      "foreleg": [
       328.1,
       673.0
      ],
      "wing": [
       322.4,
       542.6
      ],
      "tail": [
       608.6,
       624.2
      ],
      "bbox": [
       80,
       294,
       814,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       154.7,
       552.2
      ],
      "fire_angle": 291.6,
      "head": [
       185.9,
       513.3
      ],
      "chest": [
       353.0,
       602.7
      ],
      "foreleg": [
       357.1,
       664.6
      ],
      "wing": [
       347.6,
       536.2
      ],
      "tail": [
       619.1,
       616.9
      ],
      "bbox": [
       128,
       287,
       822,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       204.5,
       453.9
      ],
      "fire_angle": 261.6,
      "head": [
       251.0,
       435.8
      ],
      "chest": [
       367.4,
       590.7
      ],
      "foreleg": [
       352.1,
       652.6
      ],
      "wing": [
       368.1,
       523.3
      ],
      "tail": [
       623.7,
       618.4
      ],
      "bbox": [
       184,
       240,
       841,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       260.1,
       407.0
      ],
      "fire_angle": 246.0,
      "head": [
       312.8,
       395.7
      ],
      "chest": [
       381.8,
       576.2
      ],
      "foreleg": [
       362.1,
       636.8
      ],
      "wing": [
       389.3,
       509.0
      ],
      "tail": [
       626.2,
       618.2
      ],
      "bbox": [
       240,
       195,
       846,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       137.4,
       583.1
      ],
      "fire_angle": 292.4,
      "head": [
       157.7,
       520.2
      ],
      "chest": [
       338.5,
       600.3
      ],
      "foreleg": [
       345.5,
       661.0
      ],
      "wing": [
       337.2,
       531.4
      ],
      "tail": [
       612.8,
       627.4
      ],
      "bbox": [
       96,
       248,
       827,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       126.4,
       625.1
      ],
      "fire_angle": 298.8,
      "head": [
       135.6,
       554.9
      ],
      "chest": [
       328.9,
       605.1
      ],
      "foreleg": [
       342.0,
       663.4
      ],
      "wing": [
       325.0,
       536.9
      ],
      "tail": [
       610.0,
       629.2
      ],
      "bbox": [
       75,
       270,
       820,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       127.7,
       621.8
      ],
      "fire_angle": 297.7,
      "head": [
       137.1,
       550.0
      ],
      "chest": [
       328.9,
       606.2
      ],
      "foreleg": [
       342.7,
       664.2
      ],
      "wing": [
       325.1,
       537.7
      ],
      "tail": [
       610.7,
       626.1
      ],
      "bbox": [
       76,
       268,
       818,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       125.7,
       627.3
      ],
      "fire_angle": 299.5,
      "head": [
       134.8,
       558.0
      ],
      "chest": [
       328.9,
       604.3
      ],
      "foreleg": [
       341.5,
       662.9
      ],
      "wing": [
       324.9,
       536.4
      ],
      "tail": [
       611.4,
       622.2
      ],
      "bbox": [
       75,
       272,
       814,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       125.8,
       627.1
      ],
      "fire_angle": 299.5,
      "head": [
       134.9,
       557.7
      ],
      "chest": [
       328.9,
       604.4
      ],
      "foreleg": [
       341.5,
       662.9
      ],
      "wing": [
       324.9,
       536.5
      ],
      "tail": [
       611.8,
       618.8
      ],
      "bbox": [
       75,
       272,
       811,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       150.9,
       554.7
      ],
      "fire_angle": 291.2,
      "head": [
       180.8,
       511.5
      ],
      "chest": [
       348.2,
       602.7
      ],
      "foreleg": [
       354.0,
       664.0
      ],
      "wing": [
       342.8,
       536.1
      ],
      "tail": [
       619.3,
       614.1
      ],
      "bbox": [
       122,
       287,
       822,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       300.1,
       398.7
      ],
      "fire_angle": 230.4,
      "head": [
       365.1,
       387.1
      ],
      "chest": [
       386.6,
       581.1
      ],
      "foreleg": [
       366.0,
       641.4
      ],
      "wing": [
       393.3,
       513.1
      ],
      "tail": [
       628.9,
       613.0
      ],
      "bbox": [
       273,
       206,
       850,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       277.7,
       417.4
      ],
      "fire_angle": 241.2,
      "head": [
       335.5,
       402.1
      ],
      "chest": [
       393.8,
       588.3
      ],
      "foreleg": [
       378.1,
       650.0
      ],
      "wing": [
       395.4,
       521.6
      ],
      "tail": [
       633.5,
       616.9
      ],
      "bbox": [
       267,
       238,
       854,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       215.4,
       473.3
      ],
      "fire_angle": 267.2,
      "head": [
       260.2,
       446.0
      ],
      "chest": [
       379.4,
       595.5
      ],
      "foreleg": [
       373.2,
       658.4
      ],
      "wing": [
       375.7,
       530.0
      ],
      "tail": [
       628.4,
       618.9
      ],
      "bbox": [
       194,
       281,
       844,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       176.9,
       524.1
      ],
      "fire_angle": 285.6,
      "head": [
       212.0,
       488.6
      ],
      "chest": [
       362.6,
       600.3
      ],
      "foreleg": [
       360.8,
       663.2
      ],
      "wing": [
       357.5,
       533.9
      ],
      "tail": [
       623.4,
       619.5
      ],
      "bbox": [
       151,
       285,
       831,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       127.3,
       434.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       408.7
      ],
      "chest": [
       350.6,
       499.4
      ],
      "foreleg": [
       356.4,
       559.6
      ],
      "wing": [
       354.9,
       429.5
      ],
      "tail": [
       614.6,
       519.5
      ],
      "bbox": [
       104,
       123,
       836,
       631
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       438.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       412.3
      ],
      "chest": [
       350.6,
       502.9
      ],
      "foreleg": [
       356.4,
       563.2
      ],
      "wing": [
       367.1,
       428.2
      ],
      "tail": [
       614.4,
       526.7
      ],
      "bbox": [
       104,
       122,
       837,
       634
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       446.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       420.7
      ],
      "chest": [
       350.6,
       511.4
      ],
      "foreleg": [
       356.5,
       571.8
      ],
      "wing": [
       397.7,
       441.9
      ],
      "tail": [
       614.5,
       533.6
      ],
      "bbox": [
       104,
       201,
       837,
       641
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       455.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       429.2
      ],
      "chest": [
       350.6,
       519.9
      ],
      "foreleg": [
       356.6,
       580.4
      ],
      "wing": [
       417.1,
       483.7
      ],
      "tail": [
       614.7,
       536.3
      ],
      "bbox": [
       104,
       355,
       835,
       709
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       458.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       432.8
      ],
      "chest": [
       350.6,
       523.4
      ],
      "foreleg": [
       356.7,
       584.0
      ],
      "wing": [
       414.4,
       503.6
      ],
      "tail": [
       614.5,
       533.1
      ],
      "bbox": [
       104,
       358,
       833,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       455.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       429.2
      ],
      "chest": [
       350.6,
       519.9
      ],
      "foreleg": [
       356.6,
       580.4
      ],
      "wing": [
       417.1,
       483.7
      ],
      "tail": [
       614.2,
       525.9
      ],
      "bbox": [
       104,
       355,
       832,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       446.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       420.7
      ],
      "chest": [
       350.6,
       511.4
      ],
      "foreleg": [
       356.5,
       571.8
      ],
      "wing": [
       397.7,
       441.9
      ],
      "tail": [
       614.1,
       519.0
      ],
      "bbox": [
       104,
       325,
       833,
       641
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       438.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       412.3
      ],
      "chest": [
       350.6,
       502.9
      ],
      "foreleg": [
       356.4,
       563.2
      ],
      "wing": [
       367.1,
       428.2
      ],
      "tail": [
       614.5,
       516.3
      ],
      "bbox": [
       104,
       160,
       835,
       634
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       287.5,
       407.6
      ],
      "fire_angle": 235.2,
      "head": [
       352.5,
       388.6
      ],
      "chest": [
       381.8,
       581.1
      ],
      "foreleg": [
       362.3,
       641.8
      ],
      "wing": [
       388.4,
       513.0
      ],
      "tail": [
       626.5,
       613.0
      ],
      "bbox": [
       272,
       206,
       848,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       330.5,
       365.3
      ],
      "fire_angle": 223.6,
      "head": [
       402.2,
       354.5
      ],
      "chest": [
       398.6,
       549.8
      ],
      "foreleg": [
       376.5,
       608.8
      ],
      "wing": [
       410.7,
       487.7
      ],
      "tail": [
       631.3,
       610.8
      ],
      "bbox": [
       300,
       174,
       853,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       248.0,
       438.8
      ],
      "fire_angle": 249.6,
      "head": [
       305.0,
       408.7
      ],
      "chest": [
       389.0,
       588.3
      ],
      "foreleg": [
       377.5,
       650.5
      ],
      "wing": [
       421.1,
       514.3
      ],
      "tail": [
       628.4,
       622.3
      ],
      "bbox": [
       237,
       296,
       846,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.5,
       584.9
      ],
      "fire_angle": 276.4,
      "head": [
       192.3,
       541.4
      ],
      "chest": [
       369.8,
       638.7
      ],
      "foreleg": [
       374.8,
       700.7
      ],
      "wing": [
       413.6,
       567.0
      ],
      "tail": [
       622.6,
       655.3
      ],
      "bbox": [
       127,
       323,
       833,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       123.5,
       710.9
      ],
      "fire_angle": 284.0,
      "head": [
       158.0,
       669.5
      ],
      "chest": [
       360.2,
       681.9
      ],
      "foreleg": [
       357.1,
       745.4
      ],
      "wing": [
       418.3,
       626.4
      ],
      "tail": [
       622.1,
       696.0
      ],
      "bbox": [
       95,
       365,
       828,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       112.7,
       742.9
      ],
      "fire_angle": 278.4,
      "head": [
       151.7,
       709.8
      ],
      "chest": [
       355.4,
       705.9
      ],
      "foreleg": [
       337.5,
       766.8
      ],
      "wing": [
       418.4,
       667.1
      ],
      "tail": [
       621.1,
       726.5
      ],
      "bbox": [
       88,
       510,
       809,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       105.8,
       737.1
      ],
      "fire_angle": 269.6,
      "head": [
       149.3,
       712.7
      ],
      "chest": [
       353.0,
       710.7
      ],
      "foreleg": [
       332.4,
       770.5
      ],
      "wing": [
       415.7,
       680.5
      ],
      "tail": [
       620.2,
       734.0
      ],
      "bbox": [
       84,
       515,
       790,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       105.2,
       736.0
      ],
      "fire_angle": 267.2,
      "head": [
       149.6,
       714.7
      ],
      "chest": [
       353.0,
       713.1
      ],
      "foreleg": [
       331.5,
       772.4
      ],
      "wing": [
       413.6,
       691.2
      ],
      "tail": [
       620.2,
       736.5
      ],
      "bbox": [
       84,
       517,
       790,
       782
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       208.8,
       448.4
      ],
      "fire_angle": 258.4,
      "head": [
       256.7,
       430.6
      ],
      "chest": [
       367.4,
       590.7
      ],
      "foreleg": [
       352.1,
       652.6
      ],
      "wing": [
       368.1,
       523.3
      ],
      "tail": [
       623.7,
       618.4
      ],
      "bbox": [
       189,
       240,
       841,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       104.7,
       635.4
      ],
      "fire_angle": 279.6,
      "head": [
       141.5,
       592.2
      ],
      "chest": [
       345.8,
       609.9
      ],
      "foreleg": [
       325.3,
       669.8
      ],
      "wing": [
       339.2,
       542.6
      ],
      "tail": [
       617.6,
       626.9
      ],
      "bbox": [
       76,
       294,
       832,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       101.8,
       732.9
      ],
      "fire_angle": 276.0,
      "head": [
       138.0,
       673.8
      ],
      "chest": [
       324.1,
       624.3
      ],
      "foreleg": [
       314.7,
       687.4
      ],
      "wing": [
       329.0,
       547.3
      ],
      "tail": [
       612.1,
       630.1
      ],
      "bbox": [
       70,
       324,
       824,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       96.1,
       722.3
      ],
      "fire_angle": 273.8,
      "head": [
       134.1,
       662.5
      ],
      "chest": [
       324.1,
       624.3
      ],
      "foreleg": [
       314.7,
       687.4
      ],
      "wing": [
       329.0,
       547.3
      ],
      "tail": [
       612.6,
       628.3
      ],
      "bbox": [
       65,
       324,
       822,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       103.4,
       735.5
      ],
      "fire_angle": 276.6,
      "head": [
       139.2,
       676.7
      ],
      "chest": [
       324.1,
       624.3
      ],
      "foreleg": [
       314.7,
       687.4
      ],
      "wing": [
       329.0,
       547.3
      ],
      "tail": [
       613.3,
       624.9
      ],
      "bbox": [
       71,
       324,
       819,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.7,
       742.4
      ],
      "fire_angle": 278.0,
      "head": [
       142.4,
       684.1
      ],
      "chest": [
       324.1,
       624.3
      ],
      "foreleg": [
       314.7,
       687.4
      ],
      "wing": [
       329.0,
       547.3
      ],
      "tail": [
       613.9,
       621.0
      ],
      "bbox": [
       75,
       324,
       816,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       133.5,
       565.0
      ],
      "fire_angle": 286.4,
      "head": [
       167.5,
       526.8
      ],
      "chest": [
       348.2,
       605.1
      ],
      "foreleg": [
       355.7,
       666.1
      ],
      "wing": [
       342.3,
       538.2
      ],
      "tail": [
       619.3,
       614.5
      ],
      "bbox": [
       106,
       290,
       821,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       145.4,
       604.4
      ],
      "fire_angle": 275.6,
      "head": [
       186.2,
       575.6
      ],
      "chest": [
       384.2,
       633.9
      ],
      "foreleg": [
       396.9,
       695.6
      ],
      "wing": [
       412.7,
       554.8
      ],
      "tail": [
       624.2,
       600.9
      ],
      "bbox": [
       122,
       494,
       847,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       78.1,
       620.0
      ],
      "fire_angle": 276.0,
      "head": [
       118.0,
       583.8
      ],
      "chest": [
       321.7,
       619.5
      ],
      "foreleg": [
       342.5,
       675.8
      ],
      "wing": [
       355.1,
       542.4
      ],
      "tail": [
       597.8,
       595.4
      ],
      "bbox": [
       53,
       480,
       820,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       78.1,
       612.8
      ],
      "fire_angle": 276.0,
      "head": [
       118.0,
       576.6
      ],
      "chest": [
       321.7,
       612.3
      ],
      "foreleg": [
       298.5,
       669.9
      ],
      "wing": [
       357.5,
       536.3
      ],
      "tail": [
       597.8,
       603.4
      ],
      "bbox": [
       53,
       474,
       821,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       78.1,
       605.6
      ],
      "fire_angle": 276.0,
      "head": [
       118.0,
       569.4
      ],
      "chest": [
       321.7,
       605.1
      ],
      "foreleg": [
       325.5,
       667.4
      ],
      "wing": [
       359.8,
       530.4
      ],
      "tail": [
       597.8,
       601.0
      ],
      "bbox": [
       53,
       468,
       818,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       78.1,
       612.8
      ],
      "fire_angle": 276.0,
      "head": [
       118.0,
       576.6
      ],
      "chest": [
       321.7,
       612.3
      ],
      "foreleg": [
       343.8,
       666.0
      ],
      "wing": [
       357.5,
       536.3
      ],
      "tail": [
       597.5,
       592.9
      ],
      "bbox": [
       53,
       474,
       819,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       150.5,
       571.2
      ],
      "fire_angle": 285.2,
      "head": [
       184.7,
       531.4
      ],
      "chest": [
       355.4,
       626.7
      ],
      "foreleg": [
       325.1,
       678.1
      ],
      "wing": [
       366.1,
       547.9
      ],
      "tail": [
       625.3,
       626.8
      ],
      "bbox": [
       123,
       439,
       842,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "slam": {
    "frames": 6,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       233.1,
       413.2
      ],
      "fire_angle": 254.0,
      "head": [
       283.7,
       394.6
      ],
      "chest": [
       379.4,
       564.2
      ],
      "foreleg": [
       380.8,
       622.6
      ],
      "wing": [
       389.4,
       499.5
      ],
      "tail": [
       623.8,
       620.3
      ],
      "bbox": [
       219,
       186,
       841,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       304.7,
       348.2
      ],
      "fire_angle": 238.4,
      "head": [
       367.5,
       327.6
      ],
      "chest": [
       405.8,
       518.6
      ],
      "foreleg": [
       375.8,
       572.8
      ],
      "wing": [
       423.1,
       465.2
      ],
      "tail": [
       626.2,
       622.3
      ],
      "bbox": [
       261,
       158,
       846,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.4,
       512.0
      ],
      "fire_angle": 272.0,
      "head": [
       197.1,
       466.9
      ],
      "chest": [
       357.8,
       588.3
      ],
      "foreleg": [
       329.7,
       645.0
      ],
      "wing": [
       384.7,
       513.4
      ],
      "tail": [
       620.5,
       626.8
      ],
      "bbox": [
       131,
       275,
       837,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       100.1,
       678.1
      ],
      "fire_angle": 292.0,
      "head": [
       118.7,
       611.4
      ],
      "chest": [
       321.7,
       638.7
      ],
      "foreleg": [
       315.6,
       702.1
      ],
      "wing": [
       360.5,
       564.4
      ],
      "tail": [
       611.9,
       631.2
      ],
      "bbox": [
       56,
       440,
       824,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       87.0,
       655.1
      ],
      "fire_angle": 282.8,
      "head": [
       121.9,
       612.2
      ],
      "chest": [
       326.5,
       633.9
      ],
      "foreleg": [
       319.2,
       697.2
      ],
      "wing": [
       340.1,
       553.7
      ],
      "tail": [
       612.4,
       629.2
      ],
      "bbox": [
       59,
       353,
       823,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       135.9,
       565.0
      ],
      "fire_angle": 286.4,
      "head": [
       169.9,
       526.8
      ],
      "chest": [
       350.6,
       605.1
      ],
      "foreleg": [
       357.2,
       666.4
      ],
      "wing": [
       344.7,
       538.2
      ],
      "tail": [
       618.3,
       622.6
      ],
      "bbox": [
       109,
       290,
       829,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "breath_level": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       204.5,
       447.3
      ],
      "fire_angle": 257.6,
      "head": [
       252.2,
       432.5
      ],
      "chest": [
       367.4,
       590.7
      ],
      "foreleg": [
       352.1,
       652.6
      ],
      "wing": [
       368.1,
       523.3
      ],
      "tail": [
       623.7,
       618.4
      ],
      "bbox": [
       185,
       240,
       841,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       248.6,
       416.8
      ],
      "fire_angle": 248.0,
      "head": [
       300.9,
       403.6
      ],
      "chest": [
       379.4,
       581.1
      ],
      "foreleg": [
       360.5,
       642.0
      ],
      "wing": [
       385.9,
       513.0
      ],
      "tail": [
       626.2,
       618.2
      ],
      "bbox": [
       229,
       199,
       846,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       113.7,
       577.6
      ],
      "fire_angle": 277.6,
      "head": [
       149.8,
       524.2
      ],
      "chest": [
       340.9,
       602.7
      ],
      "foreleg": [
       349.0,
       663.1
      ],
      "wing": [
       339.2,
       533.5
      ],
      "tail": [
       615.2,
       627.4
      ],
      "bbox": [
       83,
       250,
       830,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       102.9,
       601.8
      ],
      "fire_angle": 280.0,
      "head": [
       134.9,
       540.4
      ],
      "chest": [
       331.3,
       607.5
      ],
      "foreleg": [
       345.3,
       665.5
      ],
      "wing": [
       327.3,
       538.8
      ],
      "tail": [
       610.0,
       629.2
      ],
      "bbox": [
       68,
       269,
       820,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       105.2,
       599.6
      ],
      "fire_angle": 279.8,
      "head": [
       136.8,
       536.3
      ],
      "chest": [
       331.3,
       608.6
      ],
      "foreleg": [
       346.0,
       666.3
      ],
      "wing": [
       327.1,
       539.8
      ],
      "tail": [
       610.7,
       626.1
      ],
      "bbox": [
       69,
       270,
       818,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       101.5,
       603.2
      ],
      "fire_angle": 280.1,
      "head": [
       133.8,
       543.1
      ],
      "chest": [
       331.3,
       606.7
      ],
      "foreleg": [
       344.8,
       665.0
      ],
      "wing": [
       327.4,
       538.1
      ],
      "tail": [
       611.4,
       622.2
      ],
      "bbox": [
       67,
       268,
       814,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       101.7,
       603.1
      ],
      "fire_angle": 280.1,
      "head": [
       133.9,
       542.8
      ],
      "chest": [
       331.3,
       606.8
      ],
      "foreleg": [
       344.9,
       665.0
      ],
      "wing": [
       327.4,
       538.2
      ],
      "tail": [
       611.8,
       618.8
      ],
      "bbox": [
       67,
       268,
       811,
       767
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       151.5,
       551.9
      ],
      "fire_angle": 289.2,
      "head": [
       182.9,
       509.8
      ],
      "chest": [
       350.6,
       602.7
      ],
      "foreleg": [
       355.6,
       664.3
      ],
      "wing": [
       345.2,
       536.1
      ],
      "tail": [
       619.3,
       614.1
      ],
      "bbox": [
       123,
       287,
       822,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight_strike": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       127.3,
       434.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       408.7
      ],
      "chest": [
       350.6,
       499.4
      ],
      "foreleg": [
       356.4,
       559.6
      ],
      "wing": [
       354.9,
       429.5
      ],
      "tail": [
       614.6,
       519.5
      ],
      "bbox": [
       104,
       123,
       836,
       631
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       438.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       412.3
      ],
      "chest": [
       350.6,
       502.9
      ],
      "foreleg": [
       356.4,
       563.2
      ],
      "wing": [
       367.1,
       428.2
      ],
      "tail": [
       614.4,
       526.7
      ],
      "bbox": [
       104,
       122,
       837,
       634
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       446.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       420.7
      ],
      "chest": [
       350.6,
       511.4
      ],
      "foreleg": [
       356.5,
       571.8
      ],
      "wing": [
       397.7,
       441.9
      ],
      "tail": [
       614.5,
       533.6
      ],
      "bbox": [
       104,
       201,
       837,
       641
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       455.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       429.2
      ],
      "chest": [
       350.6,
       519.9
      ],
      "foreleg": [
       356.6,
       580.4
      ],
      "wing": [
       417.1,
       483.7
      ],
      "tail": [
       614.7,
       536.3
      ],
      "bbox": [
       104,
       355,
       835,
       709
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       458.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       432.8
      ],
      "chest": [
       350.6,
       523.4
      ],
      "foreleg": [
       356.7,
       584.0
      ],
      "wing": [
       414.4,
       503.6
      ],
      "tail": [
       614.5,
       533.1
      ],
      "bbox": [
       104,
       358,
       833,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       455.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       429.2
      ],
      "chest": [
       350.6,
       519.9
      ],
      "foreleg": [
       356.6,
       580.4
      ],
      "wing": [
       417.1,
       483.7
      ],
      "tail": [
       614.2,
       525.9
      ],
      "bbox": [
       104,
       355,
       832,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       446.6
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       420.7
      ],
      "chest": [
       350.6,
       511.4
      ],
      "foreleg": [
       356.5,
       571.8
      ],
      "wing": [
       397.7,
       441.9
      ],
      "tail": [
       614.1,
       519.0
      ],
      "bbox": [
       104,
       325,
       833,
       641
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       127.3,
       438.1
      ],
      "fire_angle": 274.8,
      "head": [
       168.5,
       412.3
      ],
      "chest": [
       350.6,
       502.9
      ],
      "foreleg": [
       356.4,
       563.2
      ],
      "wing": [
       367.1,
       428.2
      ],
      "tail": [
       614.5,
       516.3
      ],
      "bbox": [
       104,
       160,
       835,
       634
      ],
      "breathing_fire": false
     }
    ]
   },
   "wingspread": {
    "frames": 7,
    "fps": 9,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       228.5,
       437.0
      ],
      "fire_angle": 259.2,
      "head": [
       276.7,
       416.2
      ],
      "chest": [
       374.6,
       581.1
      ],
      "foreleg": [
       356.6,
       642.1
      ],
      "wing": [
       381.5,
       513.3
      ],
      "tail": [
       623.8,
       620.3
      ],
      "bbox": [
       211,
       199,
       841,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       285.5,
       392.7
      ],
      "fire_angle": 242.4,
      "head": [
       342.0,
       378.3
      ],
      "chest": [
       389.0,
       564.2
      ],
      "foreleg": [
       366.4,
       623.5
      ],
      "wing": [
       399.7,
       500.4
      ],
      "tail": [
       626.2,
       622.3
      ],
      "bbox": [
       275,
       184,
       846,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       521.0
      ],
      "fire_angle": 276.8,
      "head": [
       196.4,
       470.4
      ],
      "chest": [
       357.8,
       588.3
      ],
      "foreleg": [
       344.7,
       650.5
      ],
      "wing": [
       423.4,
       569.8
      ],
      "tail": [
       620.5,
       626.8
      ],
      "bbox": [
       131,
       410,
       837,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       524.6
      ],
      "fire_angle": 276.8,
      "head": [
       196.4,
       474.0
      ],
      "chest": [
       357.8,
       591.9
      ],
      "foreleg": [
       345.0,
       654.2
      ],
      "wing": [
       405.5,
       522.9
      ],
      "tail": [
       620.6,
       626.4
      ],
      "bbox": [
       131,
       310,
       836,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       521.0
      ],
      "fire_angle": 276.8,
      "head": [
       196.4,
       470.4
      ],
      "chest": [
       357.8,
       588.3
      ],
      "foreleg": [
       344.7,
       650.5
      ],
      "wing": [
       423.4,
       569.8
      ],
      "tail": [
       621.1,
       623.9
      ],
      "bbox": [
       131,
       410,
       833,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       159.0,
       524.6
      ],
      "fire_angle": 276.8,
      "head": [
       196.4,
       474.0
      ],
      "chest": [
       357.8,
       591.9
      ],
      "foreleg": [
       345.0,
       654.2
      ],
      "wing": [
       405.5,
       522.9
      ],
      "tail": [
       621.5,
       620.1
      ],
      "bbox": [
       131,
       310,
       830,
       765
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.0,
       546.8
      ],
      "fire_angle": 288.4,
      "head": [
       187.7,
       507.4
      ],
      "chest": [
       355.4,
       600.3
      ],
      "foreleg": [
       356.6,
       662.7
      ],
      "wing": [
       350.5,
       534.1
      ],
      "tail": [
       619.1,
       616.5
      ],
      "bbox": [
       128,
       285,
       822,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_low": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       160.6,
       555.2
      ],
      "fire_angle": 287.6,
      "head": [
       194.4,
       518.6
      ],
      "chest": [
       360.2,
       614.7
      ],
      "foreleg": [
       369.1,
       676.3
      ],
      "wing": [
       351.2,
       546.1
      ],
      "tail": [
       620.9,
       579.6
      ],
      "bbox": [
       134,
       297,
       840,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       151.0,
       572.8
      ],
      "fire_angle": 289.6,
      "head": [
       183.6,
       535.0
      ],
      "chest": [
       355.4,
       621.9
      ],
      "foreleg": [
       369.7,
       682.1
      ],
      "wing": [
       344.1,
       552.2
      ],
      "tail": [
       617.1,
       559.4
      ],
      "bbox": [
       124,
       303,
       824,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       154.9,
       567.7
      ],
      "fire_angle": 289.6,
      "head": [
       187.5,
       529.9
      ],
      "chest": [
       353.0,
       624.3
      ],
      "foreleg": [
       367.9,
       683.2
      ],
      "wing": [
       394.5,
       551.3
      ],
      "tail": [
       623.0,
       626.4
      ],
      "bbox": [
       128,
       424,
       845,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.5,
       570.1
      ],
      "fire_angle": 289.6,
      "head": [
       185.1,
       532.4
      ],
      "chest": [
       350.6,
       626.7
      ],
      "foreleg": [
       366.9,
       684.5
      ],
      "wing": [
       392.5,
       554.0
      ],
      "tail": [
       615.3,
       643.2
      ],
      "bbox": [
       126,
       426,
       831,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.5,
       567.7
      ],
      "fire_angle": 289.6,
      "head": [
       185.1,
       529.9
      ],
      "chest": [
       350.6,
       624.3
      ],
      "foreleg": [
       366.0,
       682.4
      ],
      "wing": [
       342.6,
       556.2
      ],
      "tail": [
       614.8,
       644.7
      ],
      "bbox": [
       126,
       308,
       828,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.8,
       548.8
      ],
      "fire_angle": 287.6,
      "head": [
       187.7,
       512.2
      ],
      "chest": [
       355.4,
       605.1
      ],
      "foreleg": [
       360.1,
       666.9
      ],
      "wing": [
       349.8,
       538.4
      ],
      "tail": [
       621.3,
       619.6
      ],
      "bbox": [
       128,
       290,
       827,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_high": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       160.6,
       548.0
      ],
      "fire_angle": 287.6,
      "head": [
       194.4,
       511.4
      ],
      "chest": [
       360.2,
       607.5
      ],
      "foreleg": [
       364.2,
       669.5
      ],
      "wing": [
       354.6,
       540.8
      ],
      "tail": [
       616.3,
       647.8
      ],
      "bbox": [
       134,
       292,
       812,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.5,
       563.2
      ],
      "fire_angle": 289.6,
      "head": [
       186.0,
       525.4
      ],
      "chest": [
       357.8,
       612.3
      ],
      "foreleg": [
       365.3,
       673.4
      ],
      "wing": [
       351.7,
       545.3
      ],
      "tail": [
       611.5,
       662.7
      ],
      "bbox": [
       127,
       297,
       788,
       782
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       154.9,
       553.3
      ],
      "fire_angle": 289.6,
      "head": [
       187.5,
       515.5
      ],
      "chest": [
       353.0,
       609.9
      ],
      "foreleg": [
       362.2,
       671.0
      ],
      "wing": [
       395.4,
       537.4
      ],
      "tail": [
       621.8,
       598.4
      ],
      "bbox": [
       128,
       410,
       836,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.5,
       550.9
      ],
      "fire_angle": 289.6,
      "head": [
       185.1,
       513.1
      ],
      "chest": [
       350.6,
       607.5
      ],
      "foreleg": [
       359.8,
       668.8
      ],
      "wing": [
       392.5,
       534.7
      ],
      "tail": [
       618.3,
       583.9
      ],
      "bbox": [
       126,
       407,
       834,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       152.5,
       550.9
      ],
      "fire_angle": 289.6,
      "head": [
       185.1,
       513.1
      ],
      "chest": [
       350.6,
       607.5
      ],
      "foreleg": [
       359.8,
       668.8
      ],
      "wing": [
       342.1,
       539.1
      ],
      "tail": [
       616.7,
       576.4
      ],
      "bbox": [
       126,
       290,
       831,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       153.8,
       548.8
      ],
      "fire_angle": 287.6,
      "head": [
       187.7,
       512.2
      ],
      "chest": [
       355.4,
       605.1
      ],
      "foreleg": [
       360.1,
       666.9
      ],
      "wing": [
       349.8,
       538.4
      ],
      "tail": [
       621.3,
       619.6
      ],
      "bbox": [
       128,
       290,
       827,
       767
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 },
 "dragon_balerion": {
  "base": "sprites/dragon_balerion/dragon_balerion_base.png",
  "frame_size": [
   1114,
   945
  ],
  "res": 1.45,
  "facing": "left",
  "pivot": [
   557.0,
   907.6999999999999
  ],
  "recommended_scale_1080p": 1.55,
  "sheet_pattern": "sprites/dragon_balerion/sheets/dragon_balerion_{anim}.png",
  "frames_pattern": "sprites/dragon_balerion/frames/{anim}/dragon_balerion_{anim}_{index:02d}.png",
  "anchors_note": "mouth = where to spawn fire; fire_angle uses 0=down, 90=right, 180=up, 270=left",
  "animations": {
   "idle": {
    "frames": 6,
    "fps": 6,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       197.8,
       647.2
      ],
      "fire_angle": 289.2,
      "head": [
       241.3,
       599.3
      ],
      "chest": [
       432.3,
       725.3
      ],
      "foreleg": [
       432.8,
       800.9
      ],
      "wing": [
       425.3,
       641.7
      ],
      "tail": [
       750.0,
       749.7
      ],
      "bbox": [
       165,
       278,
       1004,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       208.0,
       653.3
      ],
      "fire_angle": 292.5,
      "head": [
       247.8,
       600.5
      ],
      "chest": [
       432.3,
       728.4
      ],
      "foreleg": [
       435.1,
       803.7
      ],
      "wing": [
       425.9,
       643.9
      ],
      "tail": [
       749.3,
       755.4
      ],
      "bbox": [
       173,
       273,
       1006,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       208.0,
       653.3
      ],
      "fire_angle": 292.5,
      "head": [
       247.8,
       600.5
      ],
      "chest": [
       432.3,
       728.4
      ],
      "foreleg": [
       435.1,
       803.7
      ],
      "wing": [
       425.9,
       643.9
      ],
      "tail": [
       749.8,
       753.1
      ],
      "bbox": [
       173,
       273,
       1003,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       197.8,
       647.2
      ],
      "fire_angle": 289.2,
      "head": [
       241.3,
       599.3
      ],
      "chest": [
       432.3,
       725.3
      ],
      "foreleg": [
       432.8,
       800.9
      ],
      "wing": [
       425.3,
       641.7
      ],
      "tail": [
       750.8,
       744.9
      ],
      "bbox": [
       165,
       278,
       997,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       189.6,
       644.2
      ],
      "fire_angle": 286.6,
      "head": [
       235.2,
       598.4
      ],
      "chest": [
       432.3,
       722.1
      ],
      "foreleg": [
       430.0,
       798.1
      ],
      "wing": [
       424.8,
       639.6
      ],
      "tail": [
       751.1,
       739.1
      ],
      "bbox": [
       157,
       284,
       995,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       189.6,
       644.2
      ],
      "fire_angle": 286.6,
      "head": [
       235.2,
       598.4
      ],
      "chest": [
       432.3,
       722.1
      ],
      "foreleg": [
       430.0,
       798.1
      ],
      "wing": [
       424.8,
       639.6
      ],
      "tail": [
       750.9,
       741.5
      ],
      "bbox": [
       157,
       284,
       999,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "walk": {
    "frames": 8,
    "fps": 9,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       183.4,
       660.3
      ],
      "fire_angle": 287.6,
      "head": [
       227.9,
       612.2
      ],
      "chest": [
       429.4,
       731.8
      ],
      "foreleg": [
       422.6,
       808.3
      ],
      "wing": [
       474.3,
       638.0
      ],
      "tail": [
       750.4,
       746.5
      ],
      "bbox": [
       150,
       470,
       1009,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       187.9,
       652.2
      ],
      "fire_angle": 287.6,
      "head": [
       232.3,
       604.1
      ],
      "chest": [
       429.4,
       728.2
      ],
      "foreleg": [
       424.4,
       804.4
      ],
      "wing": [
       475.6,
       635.1
      ],
      "tail": [
       749.8,
       753.9
      ],
      "bbox": [
       154,
       462,
       1011,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       189.8,
       646.8
      ],
      "fire_angle": 287.6,
      "head": [
       234.2,
       598.7
      ],
      "chest": [
       429.4,
       724.5
      ],
      "foreleg": [
       425.2,
       800.5
      ],
      "wing": [
       476.8,
       632.4
      ],
      "tail": [
       749.9,
       757.0
      ],
      "bbox": [
       156,
       456,
       1010,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       187.9,
       652.2
      ],
      "fire_angle": 287.6,
      "head": [
       232.3,
       604.1
      ],
      "chest": [
       429.4,
       728.2
      ],
      "foreleg": [
       433.1,
       803.2
      ],
      "wing": [
       475.6,
       635.1
      ],
      "tail": [
       750.5,
       749.8
      ],
      "bbox": [
       154,
       462,
       1005,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.4,
       660.3
      ],
      "fire_angle": 287.6,
      "head": [
       227.9,
       612.2
      ],
      "chest": [
       429.4,
       731.8
      ],
      "foreleg": [
       439.6,
       805.2
      ],
      "wing": [
       474.3,
       638.0
      ],
      "tail": [
       751.1,
       740.7
      ],
      "bbox": [
       150,
       470,
       1000,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       179.2,
       661.3
      ],
      "fire_angle": 287.6,
      "head": [
       223.6,
       613.1
      ],
      "chest": [
       429.4,
       728.2
      ],
      "foreleg": [
       440.2,
       800.8
      ],
      "wing": [
       475.6,
       635.1
      ],
      "tail": [
       751.3,
       739.1
      ],
      "bbox": [
       146,
       471,
       998,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       177.5,
       659.6
      ],
      "fire_angle": 287.6,
      "head": [
       221.9,
       611.5
      ],
      "chest": [
       429.4,
       724.5
      ],
      "foreleg": [
       446.2,
       793.1
      ],
      "wing": [
       476.8,
       632.4
      ],
      "tail": [
       751.3,
       741.8
      ],
      "bbox": [
       144,
       469,
       1000,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       179.2,
       661.3
      ],
      "fire_angle": 287.6,
      "head": [
       223.6,
       613.1
      ],
      "chest": [
       429.4,
       728.2
      ],
      "foreleg": [
       438.5,
       801.5
      ],
      "wing": [
       475.6,
       635.1
      ],
      "tail": [
       751.1,
       743.2
      ],
      "bbox": [
       146,
       471,
       1004,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "attack": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       245.2,
       550.5
      ],
      "fire_angle": 264.8,
      "head": [
       304.4,
       526.5
      ],
      "chest": [
       449.7,
       710.8
      ],
      "foreleg": [
       429.5,
       785.1
      ],
      "wing": [
       448.6,
       628.1
      ],
      "tail": [
       753.6,
       747.6
      ],
      "bbox": [
       219,
       259,
       1016,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       295.6,
       505.3
      ],
      "fire_angle": 253.2,
      "head": [
       361.4,
       484.8
      ],
      "chest": [
       464.2,
       696.2
      ],
      "foreleg": [
       441.9,
       769.8
      ],
      "wing": [
       471.8,
       612.5
      ],
      "tail": [
       756.5,
       747.2
      ],
      "bbox": [
       277,
       193,
       1022,
       926
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       162.8,
       804.4
      ],
      "fire_angle": 311.6,
      "head": [
       151.9,
       709.8
      ],
      "chest": [
       394.5,
       736.9
      ],
      "foreleg": [
       383.7,
       813.2
      ],
      "wing": [
       409.1,
       640.8
      ],
      "tail": [
       733.5,
       762.4
      ],
      "bbox": [
       83,
       359,
       989,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       105.7,
       800.2
      ],
      "fire_angle": 302.8,
      "head": [
       137.6,
       744.8
      ],
      "chest": [
       382.9,
       742.7
      ],
      "foreleg": [
       379.1,
       819.4
      ],
      "wing": [
       410.3,
       644.8
      ],
      "tail": [
       727.7,
       762.9
      ],
      "bbox": [
       71,
       397,
       978,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       129.7,
       759.7
      ],
      "fire_angle": 300.0,
      "head": [
       158.2,
       694.9
      ],
      "chest": [
       397.4,
       736.9
      ],
      "foreleg": [
       396.5,
       813.2
      ],
      "wing": [
       387.5,
       653.4
      ],
      "tail": [
       735.4,
       754.2
      ],
      "bbox": [
       87,
       322,
       983,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       178.5,
       672.4
      ],
      "fire_angle": 291.6,
      "head": [
       219.5,
       621.3
      ],
      "chest": [
       426.5,
       728.2
      ],
      "foreleg": [
       431.4,
       803.0
      ],
      "wing": [
       418.0,
       645.5
      ],
      "tail": [
       748.0,
       745.4
      ],
      "bbox": [
       144,
       314,
       993,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "fire_breath": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       237.2,
       548.7
      ],
      "fire_angle": 261.6,
      "head": [
       298.2,
       525.0
      ],
      "chest": [
       443.9,
       713.7
      ],
      "foreleg": [
       425.4,
       788.5
      ],
      "wing": [
       443.0,
       629.8
      ],
      "tail": [
       753.6,
       747.1
      ],
      "bbox": [
       213,
       251,
       1015,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       304.5,
       489.9
      ],
      "fire_angle": 246.0,
      "head": [
       373.7,
       475.0
      ],
      "chest": [
       461.3,
       696.2
      ],
      "foreleg": [
       437.5,
       769.5
      ],
      "wing": [
       468.8,
       612.4
      ],
      "tail": [
       756.6,
       746.9
      ],
      "bbox": [
       281,
       193,
       1022,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       158.7,
       711.6
      ],
      "fire_angle": 292.4,
      "head": [
       185.3,
       629.0
      ],
      "chest": [
       409.0,
       725.3
      ],
      "foreleg": [
       417.5,
       798.6
      ],
      "wing": [
       405.7,
       639.6
      ],
      "tail": [
       740.4,
       758.0
      ],
      "bbox": [
       105,
       261,
       999,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       146.6,
       763.5
      ],
      "fire_angle": 298.8,
      "head": [
       158.7,
       671.2
      ],
      "chest": [
       397.4,
       731.1
      ],
      "foreleg": [
       413.2,
       801.5
      ],
      "wing": [
       390.7,
       646.4
      ],
      "tail": [
       737.0,
       760.2
      ],
      "bbox": [
       81,
       291,
       991,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       148.1,
       759.5
      ],
      "fire_angle": 297.7,
      "head": [
       160.4,
       665.2
      ],
      "chest": [
       397.4,
       732.4
      ],
      "foreleg": [
       414.1,
       802.5
      ],
      "wing": [
       390.9,
       647.3
      ],
      "tail": [
       737.8,
       756.5
      ],
      "bbox": [
       81,
       287,
       988,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       145.7,
       766.1
      ],
      "fire_angle": 299.5,
      "head": [
       157.7,
       675.1
      ],
      "chest": [
       397.4,
       730.2
      ],
      "foreleg": [
       412.6,
       800.9
      ],
      "wing": [
       390.6,
       645.8
      ],
      "tail": [
       738.7,
       751.8
      ],
      "bbox": [
       81,
       293,
       983,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       145.8,
       765.8
      ],
      "fire_angle": 299.5,
      "head": [
       157.8,
       674.7
      ],
      "chest": [
       397.4,
       730.3
      ],
      "foreleg": [
       412.6,
       801.0
      ],
      "wing": [
       390.6,
       645.9
      ],
      "tail": [
       739.2,
       747.6
      ],
      "bbox": [
       81,
       293,
       980,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       174.0,
       675.7
      ],
      "fire_angle": 291.2,
      "head": [
       213.2,
       619.0
      ],
      "chest": [
       420.7,
       728.2
      ],
      "foreleg": [
       427.7,
       802.3
      ],
      "wing": [
       412.1,
       645.5
      ],
      "tail": [
       748.2,
       742.0
      ],
      "bbox": [
       137,
       314,
       993,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "stagger": {
    "frames": 4,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       352.9,
       478.5
      ],
      "fire_angle": 230.4,
      "head": [
       438.3,
       463.3
      ],
      "chest": [
       467.1,
       702.1
      ],
      "foreleg": [
       442.2,
       775.0
      ],
      "wing": [
       473.6,
       617.3
      ],
      "tail": [
       759.8,
       740.6
      ],
      "bbox": [
       325,
       206,
       1027,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       325.6,
       502.2
      ],
      "fire_angle": 241.2,
      "head": [
       401.6,
       482.2
      ],
      "chest": [
       475.8,
       710.8
      ],
      "foreleg": [
       456.9,
       785.4
      ],
      "wing": [
       476.0,
       627.7
      ],
      "tail": [
       765.4,
       745.4
      ],
      "bbox": [
       313,
       249,
       1032,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       250.4,
       573.5
      ],
      "fire_angle": 267.2,
      "head": [
       309.3,
       537.6
      ],
      "chest": [
       458.4,
       719.5
      ],
      "foreleg": [
       450.9,
       795.5
      ],
      "wing": [
       451.8,
       638.2
      ],
      "tail": [
       759.3,
       747.8
      ],
      "bbox": [
       224,
       306,
       1019,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       204.8,
       637.5
      ],
      "fire_angle": 285.6,
      "head": [
       250.9,
       591.0
      ],
      "chest": [
       438.1,
       725.3
      ],
      "foreleg": [
       436.0,
       801.3
      ],
      "wing": [
       429.9,
       642.8
      ],
      "tail": [
       753.2,
       748.5
      ],
      "bbox": [
       172,
       311,
       1003,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       144.2,
       527.4
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       493.5
      ],
      "chest": [
       423.6,
       603.4
      ],
      "foreleg": [
       430.6,
       676.2
      ],
      "wing": [
       427.2,
       516.3
      ],
      "tail": [
       742.6,
       627.6
      ],
      "bbox": [
       115,
       105,
       1010,
       763
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       531.7
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       497.8
      ],
      "chest": [
       423.6,
       607.7
      ],
      "foreleg": [
       430.6,
       680.5
      ],
      "wing": [
       442.9,
       514.4
      ],
      "tail": [
       742.4,
       636.3
      ],
      "bbox": [
       115,
       105,
       1011,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       541.9
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       508.0
      ],
      "chest": [
       423.6,
       617.9
      ],
      "foreleg": [
       430.8,
       690.9
      ],
      "wing": [
       482.1,
       531.4
      ],
      "tail": [
       742.4,
       644.8
      ],
      "bbox": [
       115,
       211,
       1010,
       775
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       552.2
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       518.3
      ],
      "chest": [
       423.6,
       628.2
      ],
      "foreleg": [
       430.9,
       701.3
      ],
      "wing": [
       507.0,
       584.3
      ],
      "tail": [
       742.6,
       648.0
      ],
      "bbox": [
       115,
       414,
       1008,
       887
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       556.5
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       522.5
      ],
      "chest": [
       423.6,
       632.4
      ],
      "foreleg": [
       430.9,
       705.6
      ],
      "wing": [
       503.6,
       609.5
      ],
      "tail": [
       742.5,
       644.1
      ],
      "bbox": [
       115,
       419,
       1005,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       552.2
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       518.3
      ],
      "chest": [
       423.6,
       628.2
      ],
      "foreleg": [
       430.9,
       701.3
      ],
      "wing": [
       507.0,
       584.3
      ],
      "tail": [
       742.1,
       635.5
      ],
      "bbox": [
       115,
       414,
       1005,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       541.9
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       508.0
      ],
      "chest": [
       423.6,
       617.9
      ],
      "foreleg": [
       430.8,
       690.9
      ],
      "wing": [
       482.1,
       531.4
      ],
      "tail": [
       742.0,
       627.0
      ],
      "bbox": [
       115,
       378,
       1006,
       775
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       531.7
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       497.8
      ],
      "chest": [
       423.6,
       607.7
      ],
      "foreleg": [
       430.6,
       680.5
      ],
      "wing": [
       442.9,
       514.4
      ],
      "tail": [
       742.4,
       623.8
      ],
      "bbox": [
       115,
       156,
       1008,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "death": {
    "frames": 8,
    "fps": 7,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       337.4,
       490.2
      ],
      "fire_angle": 235.2,
      "head": [
       422.7,
       465.2
      ],
      "chest": [
       461.3,
       702.1
      ],
      "foreleg": [
       437.8,
       775.4
      ],
      "wing": [
       467.7,
       617.2
      ],
      "tail": [
       756.9,
       740.6
      ],
      "bbox": [
       324,
       206,
       1024,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       389.8,
       437.7
      ],
      "fire_angle": 223.6,
      "head": [
       483.9,
       423.5
      ],
      "chest": [
       481.6,
       664.3
      ],
      "foreleg": [
       454.8,
       735.6
      ],
      "wing": [
       494.7,
       586.6
      ],
      "tail": [
       762.8,
       738.1
      ],
      "bbox": [
       359,
       167,
       1031,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       289.5,
       530.2
      ],
      "fire_angle": 249.6,
      "head": [
       364.4,
       490.5
      ],
      "chest": [
       470.0,
       710.8
      ],
      "foreleg": [
       456.2,
       786.0
      ],
      "wing": [
       509.1,
       618.3
      ],
      "tail": [
       759.3,
       751.9
      ],
      "bbox": [
       276,
       328,
       1022,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       176.1,
       710.5
      ],
      "fire_angle": 276.4,
      "head": [
       227.1,
       653.4
      ],
      "chest": [
       446.8,
       771.7
      ],
      "foreleg": [
       452.8,
       846.7
      ],
      "wing": [
       501.4,
       682.5
      ],
      "tail": [
       752.3,
       791.7
      ],
      "bbox": [
       143,
       356,
       1005,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       140.3,
       863.5
      ],
      "fire_angle": 284.0,
      "head": [
       185.6,
       809.1
      ],
      "chest": [
       435.2,
       823.9
      ],
      "foreleg": [
       431.4,
       900.6
      ],
      "wing": [
       508.1,
       755.4
      ],
      "tail": [
       751.7,
       840.9
      ],
      "bbox": [
       105,
       408,
       1000,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       126.8,
       900.9
      ],
      "fire_angle": 278.4,
      "head": [
       178.0,
       857.4
      ],
      "chest": [
       429.4,
       852.9
      ],
      "foreleg": [
       407.8,
       926.5
      ],
      "wing": [
       508.6,
       805.9
      ],
      "tail": [
       750.4,
       877.8
      ],
      "bbox": [
       95,
       601,
       977,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       118.0,
       892.3
      ],
      "fire_angle": 269.6,
      "head": [
       175.2,
       860.3
      ],
      "chest": [
       426.5,
       858.7
      ],
      "foreleg": [
       401.6,
       930.9
      ],
      "wing": [
       505.3,
       822.6
      ],
      "tail": [
       749.4,
       886.9
      ],
      "bbox": [
       90,
       607,
       954,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.3,
       890.5
      ],
      "fire_angle": 267.2,
      "head": [
       175.6,
       862.5
      ],
      "chest": [
       426.5,
       861.6
      ],
      "foreleg": [
       400.5,
       933.3
      ],
      "wing": [
       502.6,
       836.2
      ],
      "tail": [
       749.4,
       889.9
      ],
      "bbox": [
       90,
       610,
       954,
       945
      ],
      "breathing_fire": false
     }
    ]
   },
   "flame_sweep": {
    "frames": 7,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       242.3,
       541.7
      ],
      "fire_angle": 258.4,
      "head": [
       305.3,
       518.4
      ],
      "chest": [
       443.9,
       713.7
      ],
      "foreleg": [
       425.4,
       788.5
      ],
      "wing": [
       443.0,
       629.8
      ],
      "tail": [
       753.6,
       747.1
      ],
      "bbox": [
       218,
       251,
       1015,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       117.4,
       772.0
      ],
      "fire_angle": 279.6,
      "head": [
       165.7,
       715.1
      ],
      "chest": [
       417.8,
       736.9
      ],
      "foreleg": [
       393.1,
       809.3
      ],
      "wing": [
       407.9,
       653.4
      ],
      "tail": [
       746.3,
       757.4
      ],
      "bbox": [
       82,
       322,
       1005,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       114.1,
       890.4
      ],
      "fire_angle": 276.0,
      "head": [
       161.7,
       812.9
      ],
      "chest": [
       391.6,
       754.3
      ],
      "foreleg": [
       380.3,
       830.5
      ],
      "wing": [
       396.4,
       658.4
      ],
      "tail": [
       739.6,
       761.4
      ],
      "bbox": [
       74,
       362,
       995,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       107.0,
       877.4
      ],
      "fire_angle": 273.8,
      "head": [
       157.0,
       798.9
      ],
      "chest": [
       391.6,
       754.3
      ],
      "foreleg": [
       380.3,
       830.5
      ],
      "wing": [
       396.4,
       658.4
      ],
      "tail": [
       740.2,
       759.2
      ],
      "bbox": [
       68,
       362,
       993,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       116.0,
       893.7
      ],
      "fire_angle": 276.6,
      "head": [
       163.0,
       816.4
      ],
      "chest": [
       391.6,
       754.3
      ],
      "foreleg": [
       380.3,
       830.5
      ],
      "wing": [
       396.4,
       658.4
      ],
      "tail": [
       741.0,
       755.0
      ],
      "bbox": [
       76,
       362,
       989,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       121.3,
       902.1
      ],
      "fire_angle": 278.0,
      "head": [
       166.8,
       825.6
      ],
      "chest": [
       391.6,
       754.3
      ],
      "foreleg": [
       380.3,
       830.5
      ],
      "wing": [
       396.4,
       658.4
      ],
      "tail": [
       741.8,
       750.3
      ],
      "bbox": [
       80,
       362,
       985,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       152.4,
       687.3
      ],
      "fire_angle": 286.4,
      "head": [
       197.1,
       637.1
      ],
      "chest": [
       420.7,
       731.1
      ],
      "foreleg": [
       429.7,
       804.8
      ],
      "wing": [
       411.6,
       648.1
      ],
      "tail": [
       748.2,
       742.4
      ],
      "bbox": [
       118,
       316,
       992,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "charge": {
    "frames": 6,
    "fps": 12,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       166.2,
       733.0
      ],
      "fire_angle": 275.6,
      "head": [
       219.7,
       695.2
      ],
      "chest": [
       464.2,
       765.9
      ],
      "foreleg": [
       479.5,
       840.5
      ],
      "wing": [
       499.6,
       667.5
      ],
      "tail": [
       754.2,
       726.0
      ],
      "bbox": [
       136,
       591,
       1022,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       84.9,
       752.4
      ],
      "fire_angle": 276.0,
      "head": [
       137.4,
       704.8
      ],
      "chest": [
       388.7,
       748.5
      ],
      "foreleg": [
       413.8,
       816.6
      ],
      "wing": [
       430.3,
       652.5
      ],
      "tail": [
       722.3,
       719.3
      ],
      "bbox": [
       53,
       575,
       990,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       84.9,
       743.7
      ],
      "fire_angle": 276.0,
      "head": [
       137.4,
       696.1
      ],
      "chest": [
       388.7,
       739.8
      ],
      "foreleg": [
       360.6,
       809.5
      ],
      "wing": [
       433.1,
       645.2
      ],
      "tail": [
       722.3,
       729.1
      ],
      "bbox": [
       53,
       568,
       991,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       84.9,
       735.0
      ],
      "fire_angle": 276.0,
      "head": [
       137.4,
       687.4
      ],
      "chest": [
       388.7,
       731.1
      ],
      "foreleg": [
       393.3,
       806.4
      ],
      "wing": [
       435.9,
       638.0
      ],
      "tail": [
       722.2,
       726.2
      ],
      "bbox": [
       53,
       561,
       988,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       84.9,
       743.7
      ],
      "fire_angle": 276.0,
      "head": [
       137.4,
       696.1
      ],
      "chest": [
       388.7,
       739.8
      ],
      "foreleg": [
       415.3,
       804.7
      ],
      "wing": [
       433.1,
       645.2
      ],
      "tail": [
       722.0,
       716.4
      ],
      "bbox": [
       53,
       568,
       988,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       173.0,
       694.7
      ],
      "fire_angle": 285.2,
      "head": [
       218.0,
       642.4
      ],
      "chest": [
       429.4,
       757.2
      ],
      "foreleg": [
       392.8,
       819.3
      ],
      "wing": [
       441.8,
       659.0
      ],
      "tail": [
       755.5,
       757.3
      ],
      "bbox": [
       138,
       513,
       1017,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "slam": {
    "frames": 6,
    "fps": 8,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       271.6,
       498.8
      ],
      "fire_angle": 254.0,
      "head": [
       338.1,
       474.3
      ],
      "chest": [
       458.4,
       681.7
      ],
      "foreleg": [
       460.1,
       752.2
      ],
      "wing": [
       468.9,
       600.9
      ],
      "tail": [
       753.7,
       749.5
      ],
      "bbox": [
       254,
       181,
       1015,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       358.2,
       418.8
      ],
      "fire_angle": 238.4,
      "head": [
       440.6,
       391.8
      ],
      "chest": [
       490.3,
       626.6
      ],
      "foreleg": [
       454.0,
       692.1
      ],
      "wing": [
       509.7,
       559.4
      ],
      "tail": [
       756.6,
       751.9
      ],
      "bbox": [
       311,
       148,
       1021,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       178.3,
       622.1
      ],
      "fire_angle": 272.0,
      "head": [
       233.0,
       562.9
      ],
      "chest": [
       432.3,
       710.8
      ],
      "foreleg": [
       398.4,
       779.4
      ],
      "wing": [
       464.8,
       617.3
      ],
      "tail": [
       749.7,
       757.3
      ],
      "bbox": [
       147,
       300,
       1011,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       113.8,
       826.6
      ],
      "fire_angle": 292.0,
      "head": [
       138.2,
       738.9
      ],
      "chest": [
       388.7,
       771.7
      ],
      "foreleg": [
       381.4,
       848.4
      ],
      "wing": [
       437.2,
       679.4
      ],
      "tail": [
       739.3,
       762.7
      ],
      "bbox": [
       57,
       517,
       995,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       96.2,
       796.1
      ],
      "fire_angle": 282.8,
      "head": [
       142.0,
       739.7
      ],
      "chest": [
       394.5,
       765.9
      ],
      "foreleg": [
       385.7,
       842.4
      ],
      "wing": [
       410.7,
       666.0
      ],
      "tail": [
       739.9,
       760.2
      ],
      "bbox": [
       60,
       400,
       994,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       155.3,
       687.3
      ],
      "fire_angle": 286.4,
      "head": [
       200.0,
       637.1
      ],
      "chest": [
       423.6,
       731.1
      ],
      "foreleg": [
       431.6,
       805.1
      ],
      "wing": [
       414.5,
       648.1
      ],
      "tail": [
       747.1,
       752.3
      ],
      "bbox": [
       121,
       316,
       1001,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "breath_level": {
    "frames": 8,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       237.2,
       540.1
      ],
      "fire_angle": 257.6,
      "head": [
       299.8,
       520.6
      ],
      "chest": [
       443.9,
       713.7
      ],
      "foreleg": [
       425.4,
       788.5
      ],
      "wing": [
       443.0,
       629.8
      ],
      "tail": [
       753.6,
       747.1
      ],
      "bbox": [
       213,
       251,
       1015,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       290.5,
       502.0
      ],
      "fire_angle": 248.0,
      "head": [
       359.1,
       484.7
      ],
      "chest": [
       458.4,
       702.1
      ],
      "foreleg": [
       435.6,
       775.6
      ],
      "wing": [
       464.7,
       617.1
      ],
      "tail": [
       756.6,
       746.9
      ],
      "bbox": [
       266,
       197,
       1022,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       128.3,
       702.7
      ],
      "fire_angle": 277.6,
      "head": [
       175.8,
       632.5
      ],
      "chest": [
       411.9,
       728.2
      ],
      "foreleg": [
       421.7,
       801.2
      ],
      "wing": [
       408.0,
       642.1
      ],
      "tail": [
       743.3,
       758.0
      ],
      "bbox": [
       89,
       264,
       1002,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       115.8,
       732.7
      ],
      "fire_angle": 280.0,
      "head": [
       157.8,
       652.0
      ],
      "chest": [
       400.3,
       734.0
      ],
      "foreleg": [
       417.2,
       804.1
      ],
      "wing": [
       393.6,
       648.6
      ],
      "tail": [
       737.0,
       760.2
      ],
      "bbox": [
       71,
       288,
       991,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       118.6,
       730.2
      ],
      "fire_angle": 279.8,
      "head": [
       160.1,
       647.0
      ],
      "chest": [
       400.3,
       735.3
      ],
      "foreleg": [
       418.0,
       805.1
      ],
      "wing": [
       393.3,
       649.8
      ],
      "tail": [
       737.8,
       756.5
      ],
      "bbox": [
       73,
       289,
       988,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       114.1,
       734.4
      ],
      "fire_angle": 280.1,
      "head": [
       156.5,
       655.3
      ],
      "chest": [
       400.3,
       733.1
      ],
      "foreleg": [
       416.6,
       803.4
      ],
      "wing": [
       393.7,
       647.8
      ],
      "tail": [
       738.7,
       751.8
      ],
      "bbox": [
       70,
       287,
       983,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       114.2,
       734.2
      ],
      "fire_angle": 280.1,
      "head": [
       156.6,
       655.0
      ],
      "chest": [
       400.3,
       733.2
      ],
      "foreleg": [
       416.7,
       803.5
      ],
      "wing": [
       393.7,
       647.9
      ],
      "tail": [
       739.2,
       747.6
      ],
      "bbox": [
       70,
       288,
       980,
       927
      ],
      "breathing_fire": true
     },
     {
      "mouth": [
       174.6,
       672.1
      ],
      "fire_angle": 289.2,
      "head": [
       215.8,
       616.7
      ],
      "chest": [
       423.6,
       728.2
      ],
      "foreleg": [
       429.6,
       802.6
      ],
      "wing": [
       415.1,
       645.5
      ],
      "tail": [
       748.2,
       742.0
      ],
      "bbox": [
       138,
       314,
       993,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "flight_strike": {
    "frames": 8,
    "fps": 10,
    "loop": true,
    "per_frame": [
     {
      "mouth": [
       144.2,
       527.4
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       493.5
      ],
      "chest": [
       423.6,
       603.4
      ],
      "foreleg": [
       430.6,
       676.2
      ],
      "wing": [
       427.2,
       516.3
      ],
      "tail": [
       742.6,
       627.6
      ],
      "bbox": [
       115,
       105,
       1010,
       763
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       531.7
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       497.8
      ],
      "chest": [
       423.6,
       607.7
      ],
      "foreleg": [
       430.6,
       680.5
      ],
      "wing": [
       442.9,
       514.4
      ],
      "tail": [
       742.4,
       636.3
      ],
      "bbox": [
       115,
       105,
       1011,
       767
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       541.9
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       508.0
      ],
      "chest": [
       423.6,
       617.9
      ],
      "foreleg": [
       430.8,
       690.9
      ],
      "wing": [
       482.1,
       531.4
      ],
      "tail": [
       742.4,
       644.8
      ],
      "bbox": [
       115,
       211,
       1010,
       775
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       552.2
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       518.3
      ],
      "chest": [
       423.6,
       628.2
      ],
      "foreleg": [
       430.9,
       701.3
      ],
      "wing": [
       507.0,
       584.3
      ],
      "tail": [
       742.6,
       648.0
      ],
      "bbox": [
       115,
       414,
       1008,
       887
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       556.5
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       522.5
      ],
      "chest": [
       423.6,
       632.4
      ],
      "foreleg": [
       430.9,
       705.6
      ],
      "wing": [
       503.6,
       609.5
      ],
      "tail": [
       742.5,
       644.1
      ],
      "bbox": [
       115,
       419,
       1005,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       552.2
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       518.3
      ],
      "chest": [
       423.6,
       628.2
      ],
      "foreleg": [
       430.9,
       701.3
      ],
      "wing": [
       507.0,
       584.3
      ],
      "tail": [
       742.1,
       635.5
      ],
      "bbox": [
       115,
       414,
       1005,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       541.9
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       508.0
      ],
      "chest": [
       423.6,
       617.9
      ],
      "foreleg": [
       430.8,
       690.9
      ],
      "wing": [
       482.1,
       531.4
      ],
      "tail": [
       742.0,
       627.0
      ],
      "bbox": [
       115,
       378,
       1006,
       775
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       144.2,
       531.7
      ],
      "fire_angle": 274.8,
      "head": [
       198.3,
       497.8
      ],
      "chest": [
       423.6,
       607.7
      ],
      "foreleg": [
       430.6,
       680.5
      ],
      "wing": [
       442.9,
       514.4
      ],
      "tail": [
       742.4,
       623.8
      ],
      "bbox": [
       115,
       156,
       1008,
       767
      ],
      "breathing_fire": false
     }
    ]
   },
   "wingspread": {
    "frames": 7,
    "fps": 9,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       266.1,
       528.2
      ],
      "fire_angle": 259.2,
      "head": [
       329.4,
       500.9
      ],
      "chest": [
       452.6,
       702.1
      ],
      "foreleg": [
       430.9,
       775.9
      ],
      "wing": [
       459.4,
       617.5
      ],
      "tail": [
       753.7,
       749.5
      ],
      "bbox": [
       244,
       198,
       1015,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       335.0,
       472.4
      ],
      "fire_angle": 242.4,
      "head": [
       409.2,
       453.6
      ],
      "chest": [
       470.0,
       681.7
      ],
      "foreleg": [
       442.7,
       753.4
      ],
      "wing": [
       481.4,
       601.9
      ],
      "tail": [
       756.6,
       751.9
      ],
      "bbox": [
       322,
       177,
       1021,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.0,
       633.9
      ],
      "fire_angle": 276.8,
      "head": [
       232.1,
       567.4
      ],
      "chest": [
       432.3,
       710.8
      ],
      "foreleg": [
       416.5,
       785.9
      ],
      "wing": [
       514.5,
       689.5
      ],
      "tail": [
       749.7,
       757.3
      ],
      "bbox": [
       147,
       483,
       1011,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.0,
       638.3
      ],
      "fire_angle": 276.8,
      "head": [
       232.1,
       571.8
      ],
      "chest": [
       432.3,
       715.1
      ],
      "foreleg": [
       416.8,
       790.4
      ],
      "wing": [
       491.6,
       629.2
      ],
      "tail": [
       749.9,
       756.9
      ],
      "bbox": [
       147,
       346,
       1010,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.0,
       633.9
      ],
      "fire_angle": 276.8,
      "head": [
       232.1,
       567.4
      ],
      "chest": [
       432.3,
       710.8
      ],
      "foreleg": [
       416.5,
       785.9
      ],
      "wing": [
       514.5,
       689.5
      ],
      "tail": [
       750.4,
       753.9
      ],
      "bbox": [
       147,
       483,
       1006,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       183.0,
       638.3
      ],
      "fire_angle": 276.8,
      "head": [
       232.1,
       571.8
      ],
      "chest": [
       432.3,
       715.1
      ],
      "foreleg": [
       416.8,
       790.4
      ],
      "wing": [
       491.6,
       629.2
      ],
      "tail": [
       750.9,
       749.3
      ],
      "bbox": [
       147,
       346,
       1002,
       924
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       178.7,
       665.6
      ],
      "fire_angle": 288.4,
      "head": [
       221.6,
       613.8
      ],
      "chest": [
       429.4,
       725.3
      ],
      "foreleg": [
       430.9,
       800.7
      ],
      "wing": [
       421.5,
       643.0
      ],
      "tail": [
       748.0,
       744.8
      ],
      "bbox": [
       144,
       311,
       993,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_low": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       185.2,
       675.5
      ],
      "fire_angle": 287.6,
      "head": [
       229.7,
       627.4
      ],
      "chest": [
       435.2,
       742.7
      ],
      "foreleg": [
       445.9,
       817.2
      ],
      "wing": [
       422.3,
       657.5
      ],
      "tail": [
       750.2,
       700.3
      ],
      "bbox": [
       152,
       326,
       1014,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       173.9,
       697.0
      ],
      "fire_angle": 289.6,
      "head": [
       216.7,
       647.4
      ],
      "chest": [
       429.4,
       751.4
      ],
      "foreleg": [
       446.7,
       824.2
      ],
      "wing": [
       413.7,
       664.9
      ],
      "tail": [
       745.7,
       675.8
      ],
      "bbox": [
       140,
       333,
       995,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       178.6,
       690.9
      ],
      "fire_angle": 289.6,
      "head": [
       221.3,
       641.3
      ],
      "chest": [
       426.5,
       754.3
      ],
      "foreleg": [
       444.5,
       825.5
      ],
      "wing": [
       478.2,
       663.5
      ],
      "tail": [
       752.8,
       756.8
      ],
      "bbox": [
       145,
       492,
       1020,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       175.7,
       693.8
      ],
      "fire_angle": 289.6,
      "head": [
       218.4,
       644.2
      ],
      "chest": [
       423.6,
       757.2
      ],
      "foreleg": [
       443.3,
       827.1
      ],
      "wing": [
       475.9,
       666.7
      ],
      "tail": [
       743.4,
       777.1
      ],
      "bbox": [
       142,
       495,
       1003,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       175.7,
       690.9
      ],
      "fire_angle": 289.6,
      "head": [
       218.4,
       641.3
      ],
      "chest": [
       423.6,
       754.3
      ],
      "foreleg": [
       442.2,
       824.6
      ],
      "wing": [
       411.9,
       669.8
      ],
      "tail": [
       742.8,
       779.0
      ],
      "bbox": [
       142,
       338,
       1000,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       177.1,
       667.8
      ],
      "fire_angle": 287.6,
      "head": [
       221.6,
       619.6
      ],
      "chest": [
       429.4,
       731.1
      ],
      "foreleg": [
       435.1,
       805.7
      ],
      "wing": [
       420.6,
       648.3
      ],
      "tail": [
       750.7,
       748.6
      ],
      "bbox": [
       144,
       317,
       999,
       927
      ],
      "breathing_fire": false
     }
    ]
   },
   "tail_high": {
    "frames": 6,
    "fps": 10,
    "loop": false,
    "per_frame": [
     {
      "mouth": [
       185.2,
       666.8
      ],
      "fire_angle": 287.6,
      "head": [
       229.7,
       618.7
      ],
      "chest": [
       435.2,
       734.0
      ],
      "foreleg": [
       440.1,
       808.9
      ],
      "wing": [
       426.4,
       651.2
      ],
      "tail": [
       744.7,
       782.7
      ],
      "bbox": [
       152,
       319,
       980,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       176.8,
       685.4
      ],
      "fire_angle": 289.6,
      "head": [
       219.6,
       635.8
      ],
      "chest": [
       432.3,
       739.8
      ],
      "foreleg": [
       441.3,
       813.6
      ],
      "wing": [
       422.9,
       656.6
      ],
      "tail": [
       738.8,
       800.8
      ],
      "bbox": [
       143,
       325,
       953,
       945
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       178.6,
       673.5
      ],
      "fire_angle": 289.6,
      "head": [
       221.3,
       623.9
      ],
      "chest": [
       426.5,
       736.9
      ],
      "foreleg": [
       437.6,
       810.8
      ],
      "wing": [
       479.4,
       646.7
      ],
      "tail": [
       751.2,
       723.0
      ],
      "bbox": [
       145,
       475,
       1010,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       175.7,
       670.6
      ],
      "fire_angle": 289.6,
      "head": [
       218.4,
       621.0
      ],
      "chest": [
       423.6,
       734.0
      ],
      "foreleg": [
       434.7,
       808.1
      ],
      "wing": [
       475.9,
       643.5
      ],
      "tail": [
       747.1,
       705.5
      ],
      "bbox": [
       142,
       472,
       1007,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       175.7,
       670.6
      ],
      "fire_angle": 289.6,
      "head": [
       218.4,
       621.0
      ],
      "chest": [
       423.6,
       734.0
      ],
      "foreleg": [
       434.7,
       808.1
      ],
      "wing": [
       411.4,
       649.2
      ],
      "tail": [
       745.1,
       696.5
      ],
      "bbox": [
       142,
       317,
       1003,
       927
      ],
      "breathing_fire": false
     },
     {
      "mouth": [
       177.1,
       667.8
      ],
      "fire_angle": 287.6,
      "head": [
       221.6,
       619.6
      ],
      "chest": [
       429.4,
       731.1
      ],
      "foreleg": [
       435.1,
       805.7
      ],
      "wing": [
       420.6,
       648.3
      ],
      "tail": [
       750.7,
       748.6
      ],
      "bbox": [
       144,
       317,
       999,
       927
      ],
      "breathing_fire": false
     }
    ]
   }
  }
 }
};
