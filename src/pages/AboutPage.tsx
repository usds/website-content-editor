import {Fragment} from "react";
import {Link} from "@trussworks/react-uswds";

export const AboutPage = () => {
  return (<Fragment>
    <main id="main-content" role="main">
      <div className="grid-container">
        <div className="grid-row tablet:flex-row-reverse">
          <div
            className="tablet:grid-col-8 desktop:grid-col-12 margin-bottom-9 tablet:padding-right-4 site-c-project-content usa-prose">
            See github repo for more information:
            <Link target={"_blank"} className={"usa-link--external"} href="https://github.com/usds/website-content-editor">https://github.com/usds/website-content-editor</Link>
          </div>
        </div>
      </div>
    </main>

  </Fragment>);
}
