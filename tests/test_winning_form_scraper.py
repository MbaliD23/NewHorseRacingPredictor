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
            <td>59.6</td><td></td><td>60.0</td><td>3</td>
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
    assert horses[0].speed_index == 62
    assert horses[0].predicted_time == 59.6
    assert horses[0].previous_run_rating == 2
    assert horses[0].trainer_jockey_win_percent == 33
