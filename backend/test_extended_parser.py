import re
from bs4 import BeautifulSoup
from dataclasses import dataclass

@dataclass
class ExtendedHorseData:
    number: int
    name: str
    odds: str | None = None
    equipment: str | None = None
    pedigree_description: str | None = None
    dob: str | None = None
    silks: str | None = None
    stakes: str | None = None
    sale_price: str | None = None

def parse_extended_data(html: str):
    soup = BeautifulSoup(html, "lxml")
    
    horses = {}
    
    # The extended data is in tables that contain something like '<div class="b4">' for the number
    # and '<td class="b1">' for the name.
    
    for div_b4 in soup.find_all("div", class_="b4"):
        try:
            number = int(div_b4.get_text(strip=True))
            td_container = div_b4.parent
            if td_container.name != "td":
                continue
                
            # Odds is usually in the next <div class="b1">
            div_b1_odds = td_container.find("div", class_="b1")
            odds = div_b1_odds.get_text(strip=True) if div_b1_odds else None
            
            # The next td contains the name, equipment, pedigree, etc.
            next_td = td_container.find_next_sibling("td")
            if not next_td:
                continue
                
            name_td = next_td.find("td", class_="b1")
            if not name_td:
                continue
            name = name_td.get_text(strip=True)
            
            # Equipment is in the adjacent td right aligned
            eq_td = name_td.find_next_sibling("td")
            equipment = eq_td.get_text(strip=True) if eq_td else None
            
            # Pedigree description (Age/color/gender)
            dob_td = next_td.find(string=re.compile(r"dob:"))
            pedigree_desc = None
            dob = None
            if dob_td:
                dob = dob_td.strip().replace("dob:", "").strip()
                ped_td = dob_td.parent.find_previous_sibling("td")
                if ped_td:
                    pedigree_desc = ped_td.get_text(strip=True)
            
            # Silks and stakes are usually in subsequent rows of a parent table, but since the layout can be complex,
            # we can look at the parent row `tr`, then the next `tr`.
            parent_tr = td_container.parent
            next_tr = parent_tr.find_next_sibling("tr")
            
            silks = None
            if next_tr:
                small_td = next_tr.find("td", id="small")
                if small_td:
                    # Text nodes in this TD, the last one is usually the silks
                    text_nodes = list(small_td.stripped_strings)
                    if text_nodes:
                        silks = text_nodes[-1]
            
            # Stakes and SalePrc
            stakes = None
            sale_price = None
            
            # They might be in a td in the next_tr
            for bld_td in next_tr.find_all("td"):
                text = bld_td.get_text(strip=True)
                if text.startswith("Stakes:"):
                    stakes_val_td = bld_td.find_next_sibling("td")
                    if stakes_val_td:
                        stakes = stakes_val_td.get_text(strip=True)
                elif text.startswith("SalePrc:"):
                    sale_val_td = bld_td.find_next_sibling("td")
                    if sale_val_td:
                        sale_price = sale_val_td.get_text(strip=True)
                        
            horses[name.lower()] = ExtendedHorseData(
                number=number,
                name=name,
                odds=odds,
                equipment=equipment,
                pedigree_description=pedigree_desc,
                dob=dob,
                silks=silks,
                stakes=stakes,
                sale_price=sale_price
            )
            
        except Exception as e:
            print(f"Error parsing horse block: {e}")
            continue
            
    return horses

if __name__ == "__main__":
    with open("sample_race.html", "r", encoding="utf-8") as f:
        html = f.read()
    data = parse_extended_data(html)
    for k, v in list(data.items())[:3]:
        print(v)
