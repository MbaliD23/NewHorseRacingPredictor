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
    assert form_entries[0].race_number == "520"
    assert form_entries[0].distance == "1200"
    assert form_entries[0].jockey_name == "V.Niekerk G"
    assert form_entries[0].weight == "60.0"
    assert form_entries[0].draw == "9-10"
    assert form_entries[0].finish_position == 3
    assert form_entries[0].margin_behind_winner == "3.30"
    assert form_entries[0].winner_name == "Lowveld Lily"
    assert form_entries[0].winner_weight == "60.0"
    assert form_entries[0].odds == "25/1"
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
