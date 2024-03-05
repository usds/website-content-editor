import {Fragment} from "react";

export const AboutPage = () => {
  return (<Fragment>
    <main id="main-content" role="main">
      <div className="grid-container">
        <div className="grid-row tablet:flex-row-reverse">
          <div
            className="tablet:grid-col-8 desktop:grid-col-12 margin-bottom-9 tablet:padding-right-4 site-c-project-content usa-prose">
            [Who knows if this is useful. Maybe link to the github]
          </div>
        </div>
      </div>
    </main>

  </Fragment>);
}
