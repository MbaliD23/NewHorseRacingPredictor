from bs4 import BeautifulSoup

from app.scrapers.winning_form_scraper import WinningFormScraper


def test_extracts_new_prediction_fields_from_source_tables():
    html = """
    <html>
      <body>
        <table>
          <tr>
            <th>No</th><th>Horse</th><th>Len Beh</th><th>Speed Index</th>
            <th>Pred Time</th><th>Merit Rated</th><th>Mass</th><th>Dr</th>
            <th>B</th><th>Jockey</th><th>Trainer</th><th>Wks</th>
            <th>Fin</th><th>LBh</th><th>Dist</th><th>Jockey</th>
            <th>Bett</th><th>Time</th><th>BA</th>
          </tr>
          <tr>
            <td>3</td><td>LENOXX</td><td>0.0</td><td>[62]</td>
            <td>59.6</td><td>84</td><td>60.0</td><td>3</td>
            <td></td><td>Zackey C</td><td>Kannemeyer D</td><td>(3)</td>
            <td>2</td><td>0.9</td><td>1000</td><td>Zackey C</td>
            <td>11/10</td><td>59.61</td><td>A</td>
          </tr>
        </table>
        <p>
          Trainer/Jockey Combinations
          No Trainer Jockey Runs 1st 2nd 3rd Win Place
          3 Kannemeyer D Zackey C 12 4 1 2 33 58
          CUMULATIVE
        </p>
      </body>
    </html>
    """
    scraper = WinningFormScraper()
    soup = BeautifulSoup(html, "lxml")

    horses = scraper._extract_horses(soup, "race-1", stated_runners=1)

    assert len(horses) == 1
    assert horses[0].runner_number == 3
    assert horses[0].speed_index == 62
    assert horses[0].predicted_time == 59.6
    assert horses[0].previous_run_rating == 2
    assert horses[0].trainer_jockey_win_percent == 33
    assert horses[0].jockey_record == "12:4-1-2"
    assert horses[0].trainer_record == "12:4-1-2"
    assert horses[0].merit_rating == 84


def test_extracts_horse_profile_fields_from_legacy_block():
    html = """
    <html>
      <body>
        <table>
          <tr>
            <td><div class="b4">5/1</div></td>
            <td>
              <table>
                <tr>
                  <td class="b1">AMOR FATI</td>
                  <td class="b1">(A)</td>
                </tr>
              </table>
              <table>
                <tr>
                  <td>5 y.o. b.g.</td>
                  <td>dob: 23 Sep 2021</td>
                </tr>
              </table>
            </td>
            <td></td>
            <td rowspan="2">
              <table>
                <tr class="bld"><td>Wet:</td><td>7:1-1-0</td></tr>
                <tr class="bld"><td>Crs:</td><td>6:0-1-0</td></tr>
                <tr class="bld"><td>Dst:</td><td>2:0-0-1</td></tr>
                <tr class="bld"><td>C&D:</td><td>1:0-0-0</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" id="small">
              GLOBAL VIEW - Salimah by Trippi.<br>
              Breeder: CAMARGUE STUD<br>
              Mr Sid Moodley<br>
              Light blue, broad black band with white hoop and armbands, white collar, hooped cap
            </td>
            <td>
              <table cellpadding="1">
                <tr class="bld"><td>Tot Rns:</td><td align="right">18:3-3-2</td></tr>
                <tr class="bld"><td>Stakes:</td><td align="right">R 361607</td></tr>
                <tr class="bld"><td>SalePrc:</td><td align="right">R 150000</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    scraper = WinningFormScraper()
    soup = BeautifulSoup(html, "lxml")

    extended = scraper._extract_extended_horse_data(soup)

    assert extended["amor fati"]["pedigree_description"] == "5 y.o. b.g."
    assert extended["amor fati"]["pedigree_line"] == "GLOBAL VIEW - Salimah by Trippi."
    assert extended["amor fati"]["breeder"] == "CAMARGUE STUD"
    assert extended["amor fati"]["owner"] == "Mr Sid Moodley"
    assert extended["amor fati"]["silks"].startswith("Light blue")
    assert extended["amor fati"]["total_runs"] == "18:3-3-2"
    assert extended["amor fati"]["wet_record"] == "7:1-1-0"
    assert extended["amor fati"]["course_record"] == "6:0-1-0"
    assert extended["amor fati"]["distance_record"] == "2:0-0-1"
    assert extended["amor fati"]["course_distance_record"] == "1:0-0-0"


def test_extracts_recent_form_entries_from_legacy_block():
    html = """
    <html>
      <body>
        <table>
          <tr>
            <td><div class="b4">3/1</div></td>
            <td>
              <table>
                <tr>
                  <td class="b1">RED CORAL</td>
                  <td class="b1">(A)</td>
                </tr>
              </table>
              <table>
                <tr>
                  <td>4 y.o. b.f.</td>
                  <td>dob: 26 Sep 2022</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" id="small">
              RAFEEF - Ferrari Red by Querari.<br>
              Breeder: NARROW CREEK STUD<br>
              ASSM Racing Syndicate<br>
              Grey, dark blue epaulettes and sleeves, dark blue cap, grey stars
            </td>
            <td>
              <table cellpadding="1">
                <tr class="bld"><td>Tot Rns:</td><td align="right">13:1-3-1</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <table>
                <tr class="small">
                  <td>(5) 26.05.13</td>
                  <td>K</td>
                  <td>520</td>
                  <td>Y</td>
                  <td>MJP-F</td>
                  <td>b</td>
                  <td>1200</td>
                  <td>V.Niekerk G</td>
                  <td>60.0</td>
                  <td>9-10</td>
                  <td>A</td>
                  <td>4-5</td>
                  <td>3</td>
                  <td>3.30</td>
                  <td>Lowveld Lily 60.0</td>
                  <td>75.40</td>
                  <td>87.17</td>
                  <td>25/1</td>
                  <td>33/1</td>
                  <td>56</td>
                  <td>Stayed on at finish</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="3">Placed: L14(49 wks). Best MR:81. Is knocking on the door.</td>
          </tr>
        </table>
      </body>
    </html>
    """

    scraper = WinningFormScraper()
    soup = BeautifulSoup(html, "lxml")

    extended = scraper._extract_extended_horse_data(soup)
    form_entries = extended["red coral"]["form_entries"]

    assert len(form_entries) == 1
    assert form_entries[0].raw_date_text == "(5) 26.05.13"
    assert form_entries[0].run_date.isoformat() == "2026-05-13"
    assert form_entries[0].track == "K"
    assert form_entries[0].going == "Y"
    assert form_entries[0].race_class == "MJP-F"
    assert form_entries[0].race_number == "520"
    assert form_entries[0].distance == "1200"
    assert form_entries[0].jockey_name == "V.Niekerk G"
    assert form_entries[0].weight == "60.0"
    assert form_entries[0].draw == "9-10"
    assert form_entries[0].finish_position == 3
    assert form_entries[0].margin_behind_winner == "3.30"
    assert form_entries[0].winner_name == "Lowveld Lily"
    assert form_entries[0].winner_weight == "60.0"
    assert form_entries[0].opening_bet == "25/1"
    assert form_entries[0].starting_price == "33/1"
    assert form_entries[0].merit_rating is None
    assert form_entries[0].pts == "56"
    assert form_entries[0].comment == "Stayed on at finish"
    assert form_entries[0].speed_figure == "87.17"
    assert form_entries[0].rating == "56"
    assert form_entries[0].form_summary == "Placed: L14(49 wks). Best MR:81. Is knocking on the door."


def test_extracts_multiple_recent_form_entries_from_single_legacy_table():
    html = """
    <html>
      <body>
        <table>
          <tr>
            <td><div class="b4">3/1</div></td>
            <td>
              <table>
                <tr>
                  <td class="b1">RED CORAL</td>
                  <td class="b1">(A)</td>
                </tr>
              </table>
              <table>
                <tr>
                  <td>4 y.o. b.f.</td>
                  <td>dob: 26 Sep 2022</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" id="small">
              RAFEEF - Ferrari Red by Querari.<br>
              Breeder: NARROW CREEK STUD<br>
              ASSM Racing Syndicate<br>
              Grey, dark blue epaulettes and sleeves, dark blue cap, grey stars
            </td>
            <td>
              <table cellpadding="1">
                <tr class="bld"><td>Tot Rns:</td><td align="right">13:1-3-1</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <table>
                <tr class="small">
                  <td>(5) 26.07.09</td>
                  <td>L</td>
                  <td>54</td>
                  <td>G</td>
                  <td>MP-3</td>
                  <td>b</td>
                  <td>1400</td>
                  <td>Lerena G</td>
                  <td>60.0</td>
                  <td>(78) A 7-8</td>
                  <td></td>
                  <td></td>
                  <td>5</td>
                  <td>11.50</td>
                  <td>Greek Heiress 60.0</td>
                  <td>86.65</td>
                  <td>87.32</td>
                  <td>18/10</td>
                  <td>15/10F</td>
                  <td>55</td>
                  <td>Set pace-drew off</td>
                </tr>
                <tr>
                  <td colspan="21">
                    <table>
                      <tr>
                        <td>Set pace-drew off</td>
                        <td align="right">55</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr class="small">
                  <td>(4) 26.06.21</td>
                  <td>K</td>
                  <td>580</td>
                  <td>S</td>
                  <td>OM-F</td>
                  <td>b</td>
                  <td>1400</td>
                  <td>V.Niekerk G</td>
                  <td>57.0</td>
                  <td>A 5-3</td>
                  <td></td>
                  <td></td>
                  <td>3</td>
                  <td>3.00</td>
                  <td>Meg's Legacy 57.5</td>
                  <td>88.29</td>
                  <td>87.06</td>
                  <td>33/10</td>
                  <td>33/10</td>
                  <td>57</td>
                  <td>Slow-stayed on</td>
                </tr>
                <tr>
                  <td colspan="21">
                    <table>
                      <tr>
                        <td>Slow-stayed on</td>
                        <td align="right">57</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr class="small">
                  <td>(5) 26.05.13</td>
                  <td>K</td>
                  <td>520</td>
                  <td>Y</td>
                  <td>MJP-F</td>
                  <td>b</td>
                  <td>1200</td>
                  <td>V.Niekerk G</td>
                  <td>60.0</td>
                  <td>9-10</td>
                  <td>A</td>
                  <td>4-5</td>
                  <td>3</td>
                  <td>3.30</td>
                  <td>Lowveld Lily 60.0</td>
                  <td>75.40</td>
                  <td>87.17</td>
                  <td>25/1</td>
                  <td>33/1</td>
                  <td>56</td>
                  <td>Stayed on at finish</td>
                </tr>
                <tr>
                  <td colspan="21">
                    <table>
                      <tr>
                        <td>Placed: L14(49 wks). Best MR:81. Is knocking on the door.</td>
                        <td align="right">943-1478728224</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    scraper = WinningFormScraper()
    soup = BeautifulSoup(html, "lxml")

    extended = scraper._extract_extended_horse_data(soup)
    form_entries = extended["red coral"]["form_entries"]

    assert len(form_entries) == 3
    assert [entry.raw_date_text for entry in form_entries] == [
        "(5) 26.07.09",
        "(4) 26.06.21",
        "(5) 26.05.13",
    ]


def test_extracts_jockey_and_trainer_performance_records():
    html = """
    <html>
      <body>
        <table>
          <tr>
            <td align="center" valign="top" rowspan="2">
              <div class="b4">2</div><br><div class="b1">5/1</div><br><span class="b1">75</span>
            </td>
            <td>
              <table cellpadding="0" width="100%">
                <tr><td class="b1">BAI YULU</td><td align="right" class="b1">(A)</td></tr>
              </table>
              <table cellpadding="0" width="100%">
                <tr><td>3 y.o. b f.</td><td align="right">dob: 15 Oct 2022</td></tr>
              </table>
            </td>
            <td>
              <table cellpadding="0" width="100%">
                <tr><td valign="top"><div class="b2">60.0</div></td><td align="right"><div class="b2">2</div></td></tr>
              </table>
            </td>
            <td>
              <table cellpadding="2" width="100%">
                <tr>
                  <td valign="top">
                    <div class="itbld">Marco<br>V/RENSBURG</div>
                    <span class="bld">84</span>* 30:<span class="bld">3</span>-2-7
                  </td>
                  <td valign="top">
                    <div class="itbld">Cliffie<br>MILLER</div>
                    <span class="bld">72</span>* 30:<span class="bld">2</span>-2-7
                  </td>
                </tr>
              </table>
            </td>
            <td valign="top" rowspan="2">
              <table cellpadding="0">
                <tr class="bld"><td>Wet:</td><td>0:0-0-0</td></tr>
                <tr class="bld"><td>Crs:</td><td>5:1-1-1</td></tr>
                <tr class="bld"><td>Dst:</td><td>3:1-0-0</td></tr>
                <tr class="bld"><td>C&D:</td><td>2:1-0-0</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" id="small">
              DANON PLATINA - Celestial Storm by Galileo.<br>
              Breeder: MAURITZFONTEIN & WILGERBOSDRIFT<br>
              Mr W G C Miller<br>
              Light blue, dark green spots, light blue sleeves, dark green cap
            </td>
            <td valign="top">
              <table cellpadding="1">
                <tr class="bld"><td>Tot Rns:</td><td align="right">8:1-1-1</td></tr>
                <tr class="bld"><td>Stakes:</td><td align="right">R 75000</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """
    scraper = WinningFormScraper()
    soup = BeautifulSoup(html, "lxml")

    extended = scraper._extract_extended_horse_data(soup)

    assert "bai yulu" in extended
    assert extended["bai yulu"]["jockey_record"] == "30:3-2-7"
    assert extended["bai yulu"]["trainer_record"] == "30:2-2-7"


def test_extracts_made_to_measure_formline_fields():
    html = """
    <html>
      <body>
        <table>
          <tr>
            <td align="center" valign="top" rowspan="2">
              <div class="b4">1</div><br><div class="b1">2/1</div>
            </td>
            <td>
              <table cellpadding="0" width="100%">
                <tr><td class="b1">MADE TO MEASURE</td><td align="right" class="b1">(A)</td></tr>
              </table>
              <table cellpadding="0" width="100%">
                <tr><td>3 y.o. b g.</td><td align="right">dob: 12 Oct 2022</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" id="small">
              ERUPT - Rose Garden by Spectrum.<br>
              Breeder: MAINE CHANCE FARMS<br>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <table>
                <tr class="small">
                  <td>(4) 26.07.31</td>
                  <td>P</td>
                  <td>547</td>
                  <td>G</td>
                  <td>OM</td>
                  <td>b</td>
                  <td>1400</td>
                  <td>Fourie R</td>
                  <td>58.5</td>
                  <td>(73)</td>
                  <td>A</td>
                  <td>6-10</td>
                  <td>2</td>
                  <td>0.50</td>
                  <td>Kaleesh Cyborg 61.0</td>
                  <td>83.55</td>
                  <td>101.15</td>
                  <td>2/1</td>
                  <td>33/10</td>
                  <td>64</td>
                  <td>Running on at finish</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """
    scraper = WinningFormScraper()
    soup = BeautifulSoup(html, "lxml")

    extended = scraper._extract_extended_horse_data(soup)
    form_entries = extended["made to measure"]["form_entries"]

    assert len(form_entries) == 1
    entry = form_entries[0]
    assert entry.weeks == "4"
    assert entry.run_date.isoformat() == "2026-07-31"
    assert entry.track == "P"
    assert entry.ref_no == "547"
    assert entry.going == "G"
    assert entry.race_class == "OM"
    assert entry.course_desc == "b"
    assert entry.distance == "1400"
    assert entry.jockey_name == "Fourie R"
    assert entry.weight == "58.5"
    assert entry.merit_rating == "73"
    assert entry.shoeing == "A"
    assert entry.draw == "6-10"
    assert entry.finish_position == 2
    assert entry.margin_behind_winner == "0.50"
    assert entry.winner_name == "Kaleesh Cyborg"
    assert entry.winner_weight == "61.0"
    assert entry.time == "83.55"
    assert entry.adjusted_time == "101.15"
    assert entry.open_odds == "2/1"
    assert entry.starting_price == "33/10"
    assert entry.pts == "64"
    assert entry.comment == "Running on at finish"


def test_sparse_unraced_runner_no_fake_data():
    html = """
    <html>
      <body>
        <table>
          <tr>
            <td align="center" valign="top" rowspan="2">
              <div class="b4">5</div>
            </td>
            <td>
              <table cellpadding="0" width="100%">
                <tr><td class="b1">FIRST TIMER</td></tr>
              </table>
              <table cellpadding="0" width="100%">
                <tr><td>2 y.o. b c.</td><td align="right">dob: 10 Nov 2023</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" id="small">
              GIMMETHEGREENLIGHT - Starry Night by Western Winter.<br>
              Breeder: DRAKENSTEIN STUD<br>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <table>
                <tr class="small">
                  <td>(0) 26.08.01</td>
                  <td>K</td>
                  <td>101</td>
                  <td>G</td>
                  <td>MJP</td>
                  <td>b</td>
                  <td>1000</td>
                  <td>Domeyer A</td>
                  <td>58.0</td>
                  <td></td>
                  <td>A</td>
                  <td>1-8</td>
                  <td>4</td>
                  <td>4.20</td>
                  <td>Captain Fast 58.0</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>Green, ran on</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """
    scraper = WinningFormScraper()
    soup = BeautifulSoup(html, "lxml")

    extended = scraper._extract_extended_horse_data(soup)
    assert "first timer" in extended
    first_timer = extended["first timer"]
    assert first_timer["odds"] is None
    assert first_timer["form_entries"][0].time is None
    assert first_timer["form_entries"][0].adjusted_time is None
    assert first_timer["form_entries"][0].opening_bet is None
    assert first_timer["form_entries"][0].starting_price is None
    assert first_timer["form_entries"][0].merit_rating is None
    assert first_timer["form_entries"][0].pts is None
    assert first_timer["form_entries"][0].comment == "Green, ran on"



