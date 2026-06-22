import urllib.request
import json
import re

url = "https://cf.biwenger.com/api/v2/competitions/la-liga/data?score=2"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
)

# Accent removal helper
def remove_accents(input_str):
    accents = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'ü': 'u', 'Ü': 'U', 'ñ': 'ñ', 'Ñ': 'Ñ' # keep ñ/Ñ for Spanish, but we will add n/N as synonyms
    }
    for char, replacement in accents.items():
        input_str = input_str.replace(char, replacement)
    return input_str

# Team name formatting dictionary for cleaner display
TEAM_NAME_MAP = {
    "Athletic": "Athletic Club",
    "Atlético": "Atlético de Madrid",
    "Barcelona": "FC Barcelona",
    "Celta": "Celta de Vigo",
    "Espanyol": "RCD Espanyol",
    "Sevilla": "Sevilla FC",
    "Real Sociedad": "Real Sociedad",
    "Betis": "Real Betis",
    "Zaragoza": "Real Zaragoza",
    "Madrid": "Real Madrid",
    "Girona": "Girona FC",
    "Osasuna": "CA Osasuna",
    "Vallecano": "Rayo Vallecano",
    "Getafe": "Getafe CF",
    "Valencia": "Valencia CF",
    "Mallorca": "RCD Mallorca",
    "Alavés": "Deportivo Alavés",
    "Las Palmas": "UD Las Palmas",
    "Leganés": "CD Leganés",
    "Valladolid": "Real Valladolid",
    "Villarreal": "Villarreal CF"
}

# Historical legends to pre-populate (not present in current active players)
HISTORICAL_PLAYERS = [
    {
        "name": "Cristiano Ronaldo",
        "team": "Real Madrid",
        "country": "Portugal",
        "searchKeys": ["cristiano ronaldo", "cristiano", "ronaldo", "cr7", "c. ronaldo", "ronald"]
    },
    {
        "name": "Ronaldo Nazário",
        "team": "Real Madrid / FC Barcelona",
        "country": "Brasil",
        "searchKeys": ["ronaldo nazario", "ronaldo", "o fenomeno", "ronaldo nazario de lima", "r. nazario", "ronald"]
    },
    {
        "name": "Ronaldinho",
        "team": "FC Barcelona",
        "country": "Brasil",
        "searchKeys": ["ronaldinho", "ronaldinho gaucho", "gaucho", "ronald"]
    },
    {
        "name": "Telmo Zarra",
        "team": "Athletic Club",
        "country": "España",
        "searchKeys": ["telmo zarra", "zarra"]
    },
    {
        "name": "Hugo Sánchez",
        "team": "Real Madrid",
        "country": "México",
        "searchKeys": ["hugo sanchez", "sanchez", "hugol"]
    },
    {
        "name": "Alfredo Di Stéfano",
        "team": "Real Madrid",
        "country": "Argentina / España",
        "searchKeys": ["alfredo di stefano", "di stefano", "stefano", "alfredo"]
    },
    {
        "name": "César Rodríguez",
        "team": "FC Barcelona",
        "country": "España",
        "searchKeys": ["cesar rodriguez", "cesar"]
    },
    {
        "name": "Quini",
        "team": "Sporting de Gijón / FC Barcelona",
        "country": "España",
        "searchKeys": ["quini", "enrique castro"]
    },
    {
        "name": "Pahiño",
        "team": "Celta / Real Madrid / Depor",
        "country": "España",
        "searchKeys": ["pahino", "manuel fernandez"]
    },
    {
        "name": "Pedro Rodríguez",
        "team": "FC Barcelona",
        "country": "España",
        "searchKeys": ["pedro rodriguez", "pedro", "pedrito"]
    },
    {
        "name": "Eusebio Sacristán",
        "team": "Valladolid / Atlético / Barca",
        "country": "España",
        "searchKeys": ["eusebio sacristan", "eusebio"]
    },
    {
        "name": "Paco Buyo",
        "team": "Real Madrid / Sevilla",
        "country": "España",
        "searchKeys": ["paco buyo", "buyo", "francisco buyo"]
    },
    {
        "name": "Manolo Sanchís",
        "team": "Real Madrid",
        "country": "España",
        "searchKeys": ["manolo sanchis", "sanchis", "manuel sanchis"]
    }
]

try:
    print("Fetching active player rosters from Biwenger...")
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        data = json.loads(content)
        
        raw_players = data["data"]["players"]
        raw_teams = data["data"]["teams"]
        
        # Build team mapping
        team_map = {}
        for t_id, t_info in raw_teams.items():
            name = t_info.get("name", "")
            team_map[int(t_id)] = TEAM_NAME_MAP.get(name, name)
            
        print(f"Loaded {len(team_map)} team structures.")
        
        # Parse active players
        active_list = []
        for p_id, p_info in raw_players.items():
            name = p_info.get("name", "").strip()
            
            team_id = p_info.get("teamID")
            team_name = team_map.get(team_id, "Desconocido")
            
            # Generate search keys
            search_keys = []
            
            # 1. Lowercase name
            clean_name = name.lower()
            search_keys.append(clean_name)
            
            # 2. Lowercase name without accents
            no_acc = remove_accents(clean_name)
            if no_acc != clean_name:
                search_keys.append(no_acc)
                
            # 3. Add ñ to n alternative if containing ñ
            if "ñ" in no_acc:
                search_keys.append(no_acc.replace("ñ", "n"))
                
            # 4. Individual name parts
            parts = re.split(r'\s+', no_acc)
            for part in parts:
                if len(part) > 2:
                    search_keys.append(part)
                    if "ñ" in part:
                        search_keys.append(part.replace("ñ", "n"))
            
            # Specific custom aliases for popular active players
            if "vinicius" in clean_name or "vini" in clean_name:
                search_keys.extend(["vini", "vini jr", "vinicius", "vinicius jr"])
            if "lewandowski" in clean_name:
                search_keys.extend(["lewa", "lewandowski", "robert lewandowski"])
            if "bellingham" in clean_name:
                search_keys.extend(["jude", "jude bellingham"])
            if "griezmann" in clean_name:
                search_keys.extend(["antoine", "griezmann", "grizou"])
            if "pedro gonzalez" in clean_name or name.lower() == "pedri":
                search_keys.extend(["pedri"])
            if "yamal" in clean_name:
                search_keys.extend(["lamine", "lamine yamal"])
            if "aspas" in clean_name:
                search_keys.extend(["iago", "iago aspas"])
            if "gavi" in clean_name:
                search_keys.extend(["gavi", "pablo gavi"])
            if "courtois" in clean_name:
                search_keys.extend(["thibaut", "courtois"])
            if "modric" in clean_name:
                search_keys.extend(["luka", "modric"])
            if "valverde" in clean_name:
                search_keys.extend(["fede", "fede valverde", "federico valverde"])
            if "ter stegen" in clean_name:
                search_keys.extend(["stegen", "marc ter stegen", "ter stegen"])
            if "de paul" in clean_name:
                search_keys.extend(["depaul", "de paul", "rodrigo de paul"])
                
            # Deduplicate search keys
            search_keys = list(set(search_keys))
            
            active_list.append({
                "name": name,
                "team": team_name,
                "country": "", # optional
                "searchKeys": search_keys
            })
            
        print(f"Processed {len(active_list)} active players.")
        
        # Merge with historical (avoid duplicates)
        final_players = list(HISTORICAL_PLAYERS)
        for act in active_list:
            # Check if active player is already represented in historical list
            dupe = False
            for hist in final_players:
                if hist["name"].lower() == act["name"].lower():
                    # Keep historical search keys, merge them
                    hist["searchKeys"] = list(set(hist["searchKeys"] + act["searchKeys"]))
                    dupe = True
                    break
            if not dupe:
                final_players.append(act)
                
        print(f"Total players in database (active + historical): {len(final_players)}")
        
        # Sort database by name
        final_players.sort(key=lambda x: x["name"])
        
        # Write to javascript file src/utils/players-db.js
        target_path = "../src/utils/players-db.js"
        js_content = "// Automatically generated database of LaLiga players\n"
        js_content += "export const LALIGA_PLAYERS_DB = " + json.dumps(final_players, indent=2, ensure_ascii=False) + ";\n"
        
        with open(target_path, "w", encoding="utf-8") as js_file:
            js_file.write(js_content)
            
        print("Successfully generated database at " + target_path + "!")
        
except Exception as e:
    print("Error:", e)
