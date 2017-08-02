# Atlas-Magic :sparkles:

This tool will:  
-> download a shp file from CDN  
-> apply an optional filter  
-> converts to topojson  
-> simplify geometries while preserving topology

### Run it
```
npx atlas-magic us-rivers > newtopojson.json
```

Watch the magic happen...

## Command Line Reference

<a name="atlas-magic" href="#atlas-magic">#</a><b>atlas-magic</b> &lt;<i>command</i>&gt; [<i>options…</i>]  [`<>`](https://github.com/bradoyler/atlas-magic/blob/master/bin/atlas-magic.js "Source")

where __&lt;command&gt;__ is:  
`us-counties, us-cities, us-rivers, us-states, combine-topo`

__[options...]__

| key | default | example
|--------|--------|---------
| --listfile |  | `myFIPScodes.csv` (used for filtering)
| --filterkey | `FIPS` | &nbsp;
| --max | `100000` | for population (when applied)
| --simplify | `0.006` | &nbsp;
| --quantize | `1e6` | &nbsp;

### Examples

##### US Cities with population over 250k
```sh
$ atlas-magic us-cities --max 250000 > cities_over_250k.json
```

##### US Counties filtered by a newline delimited list
```sh
$ atlas-magic us-counties --listfile fips_codes.csv > my-us-counties.json
```

##### US Rivers
```sh
$ atlas-magic us-rivers > us-rivers.json
```

##### US States
```sh
$ atlas-magic us-states > us-states.json
```

##### Combine topologies (not merge)
```sh
$ atlas-magic us-states > us-states.json
$ atlas-magic us-counties --listfile fips_codes.csv > us-counties.json
$ atlas-magic combine-topo us-states.json us-counties.json > us-states-with-counties.json
```
