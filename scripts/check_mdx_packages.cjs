// Because MDX Editor doesn't allow all the customization we need, we have to write
// code that runs within the context of that library. THAT requires we have the exact
// same revisions for dependencies or we get weird compiler errors from the libraries.
//
// This script just sanity checks that the revisions match.
//

const path = require('path');
const fs = require('fs');

function intersection_keys(o1, o2) {
  const [k1, k2] = [Object.keys(o1), Object.keys(o2)];
  const [first, next] = k1.length > k2.length ? [k2, o1] : [k1, o2];
  return first.filter(k => k in next);
}

function check_mdx_packages() {
  // load our package.json,
  const basepath = ".";
  const ourpackagepath = path.join(basepath, 'package.json');
  const ourpackage = JSON.parse(fs.readFileSync(ourpackagepath, 'utf8'));

  // find the mdx dependency
  const mdxpackagepath = path.join(basepath, 'node_modules/@mdxeditor/editor/package.json');
  const mdxpackage = JSON.parse(fs.readFileSync(mdxpackagepath, 'utf8'));

  console.log(`Checking our package.json and mdxeditor's package.json for possible conflicts`);

  // check that dev doesn't over devDependencies and dependencies don't have any overlaps
  {
    const overlapkeys = intersection_keys(ourpackage["dependencies"] ?? {}, ourpackage["devDependencies"] ?? {});
    if (overlapkeys.length > 0) {
      console.log(`  "${ourpackagepath}" has overlapping "dependencies" and "devDependencies" for keys: ${JSON.stringify(overlapkeys)}`);
    }
  }

  // check the "peerDependencies" have the same version as what in "devDependencies" and "dependencies"
  const allourdepends = {...(ourpackage["dependencies"] ??{}), ...(ourpackage["devDependencies"] ?? {})};
  {
    const peerdepends = ourpackage["peerDependencies"] ?? {}; // readabillity
    const overlapkeys = intersection_keys(peerdepends, allourdepends ?? {});
    if (overlapkeys.length > 0) {
      // loop over and compare values
      for (const key of overlapkeys) {
        if (allourdepends[key] !== peerdepends[key]) {
          console.log(`  "${ourpackagepath}" package for "peerDependencies" version mismatch for "${key}" ("${allourdepends[key]}" <> ${peerdepends[key]})`);
        }
      }
    }
  }

  // make sure the "resolutions" versions match
  {
    let printed_header = false;
    const resolutiondepends = ourpackage["resolutions"] ?? {}; // readabillity
    const overlapkeys = intersection_keys(resolutiondepends, allourdepends ?? {});
    if (overlapkeys.length > 0) {
      // loop over and compare values
      for (const key of overlapkeys) {
        if (allourdepends[key] !== resolutiondepends[key]) {
          if (!printed_header) {
            console.warn(`  "${ourpackagepath}" package for the "resolutiondepends" version mismatch.\n    [major.minor.fix] as long as major and minor are close, it's probably fine.:`);
            printed_header = true;
          }

          console.warn(`  "${key}" "${allourdepends[key]}"<>"${resolutiondepends[key]}" (resolutiondepends)`);
        }
      }
    }
  }

  // Now check against the mdxeditor we have installed.
  {
    let printed_header = false;
    const allmdxdepends = {...(mdxpackage["dependencies"] ?? {})};
    const overlapkeys = intersection_keys(allmdxdepends, allourdepends);
    if (overlapkeys.length > 0) {
      // loop over and compare values
      for (const key of overlapkeys) {
        if (allourdepends[key] !== allmdxdepends[key]) {
          if (!printed_header) {
            console.warn(`  "${ourpackagepath}" package vs "${mdxpackagepath}" dependencies package (more important):`);
            printed_header = true;
          }
          console.warn(`    "${key}": (ours) "${allourdepends[key]}"<>"${allmdxdepends[key]}" (mdx)`);
        }
      }
    }
  }

  {
    let printed_header = false;
    const allmdxdepends = { ...(mdxpackage["devDependencies"] ?? {})};
    const overlapkeys = intersection_keys(allmdxdepends, allourdepends);
    if (overlapkeys.length > 0) {
      // loop over and compare values
      for (const key of overlapkeys) {
        if (allourdepends[key] !== allmdxdepends[key]) {
          if (!printed_header) {
            console.log(`  "${ourpackagepath}" package vs "${mdxpackagepath}" devDependencies package (less important, but watch for issues):`);
            printed_header = true;
          }
          console.log(`    DEV "${key}":  (ours) "${allourdepends[key]}"<>"${allmdxdepends[key]}" (mdx)`);
        }
      }
    }
  }
}

check_mdx_packages();
