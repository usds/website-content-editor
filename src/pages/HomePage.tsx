import {Fragment} from "react";
import {NavLink} from "react-router-dom";

export const HomePage = () => {
  return (<Fragment>
      <main id="main-content" role="main">
        <div className="grid-container">
          <div className="grid-row tablet:flex-row-reverse">
            <div
              className="tablet:grid-col-8 desktop:grid-col-12 margin-bottom-9 tablet:padding-right-4 site-c-project-content usa-prose">

              <NavLink className={"usa-button"} key={"blogedit"} to="/blogedit">News-and-blog editor</NavLink><br/>
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}
