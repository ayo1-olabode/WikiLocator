import React, { useRef, useState } from "react";
import "./MainPage.css";
import Sidebar from "../components/SideBar";
import { Tooltip } from "@chakra-ui/react";
import { css } from "@chakra-ui/react";

import {
  Container,
  Box,
  Input,
  Button,
  Divider,
  Image,
  Portal,
} from "@chakra-ui/react";
import {
  GoogleMap,
  useJsApiLoader,
  StandaloneSearchBox,
  Marker,
} from "@react-google-maps/api";

import returnData from "../api";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Stack,
} from "@chakra-ui/react";

import { InputGroup, InputRightElement, IconButton } from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";

import { GrLocation } from "react-icons/gr";
import logo from "../assets/pin.svg";

import {
  // other imports
  SimpleGrid,
  Box as Card,
  Box as CardHeader,
  Box as CardBody,
  Box as CardFooter,
  Heading,
  Text,
} from "@chakra-ui/react";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: -3.745,
  lng: -38.523,
};

type Sight = {
  pageid: number;
  title: string;
  coordinates: { lat: number; lon: number; primary: string; globe: string }[];
  thumbnail?: { source: string; width: number; height: number };
};

const googleMapsLibraries = ["places"];
console.log(returnData(37.7891838, -122.4033522));

function MainPage() {
  const [searchField, setSearchField] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(-1);
  const tooltipRef = useRef(null);

  const customTooltipStyle3 = {
    ".chakra-tooltip__popper": {
      zIndex: 10,
    },
    ".chakra-tooltip__arrow": {
      display: "none",
    },
  };

  const api_map = import.meta.env.VITE_GOOGLE_MAPS_API;
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: api_map,
    libraries: googleMapsLibraries, // Use the constant here
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const [markers, setMarkers] = useState<Array<{ lat: number; lng: number }>>(
    []
  );

  const [nearbySights, setNearbySights] = useState<Sight[]>([]);

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const place = searchBoxRef.current.getPlaces()[0];
    if (place) {
      setCenter({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });

      // Set a default zoom level after searching
      if (map) {
        map.setZoom(12); // You can adjust this value according to your preference
      }
    }
  };

  const onLoad = (mapInstance: google.maps.Map) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const iconUrl = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${encodeURIComponent(
          GrLocation({ size: 24 }).props.d
        )}" /></svg>`;

        const blimpMarker = new google.maps.Marker({
          position: currentLocation,
          map: mapInstance,
          icon: {
            url: logo,
            scaledSize: new google.maps.Size(32, 32),
          },
        });

        mapInstance.setCenter(currentLocation);
        mapInstance.setZoom(17);
      },
      () => console.error("Error getting user location")
    );

    setMap(mapInstance);
  };

  const onUnmount = (mapInstance: google.maps.Map) => {
    setMap(null);
  };

  const onMapClick = async (event: google.maps.MapMouseEvent) => {
    const newMarker = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarkers([newMarker]); // Keep only the most recent marker

    try {
      const sights = await returnData(newMarker.lat, newMarker.lng);
      setNearbySights(sights);
    } catch (error) {
      console.error("Error fetching nearby sights:", error);
    }
  };

  const handleClearField = () => {
    setSearchField("");
  };

  const handleSearch = async () => {
    if (!searchField) return;
    const map = new google.maps.Map(document.createElement("div")); // Create a dummy map
    const service = new google.maps.places.PlacesService(map); // Create a PlacesService instance

    const request = {
      query: searchField,
      location: new google.maps.LatLng(center.lat, center.lng),
      radius: 12, // Set search radius
    };

    const callback = (
      results: google.maps.places.PlaceResult[],
      status: google.maps.places.PlacesServiceStatus
    ) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        setCenter({ lat, lng });
      }
    };

    service.textSearch(request, callback);
  };

  return isLoaded ? (
    <>
      {/* <Sidebar /> */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
        center={center}
        zoom={7}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
      >
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))}

        {nearbySights.map((sight) => (
          <Marker
            key={sight.pageid}
            position={{
              lat: sight.coordinates[0].lat,
              lng: sight.coordinates[0].lon,
            }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            }}
          />
        ))}
      </GoogleMap>
      <Box
        position="absolute"
        top="20px"
        bgGradient={"linear(to-r, blue.500, blue.300)"}
        left="35px"
        width="400px"
        height="calc(100vh - 70px)"
        overflowY="scroll"
        //hide scroll bar
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
        bg="white"
        boxShadow="md"
        p="4"
        borderRadius="md"
        zIndex="1"
      >
        <Box width="100%">
          <StandaloneSearchBox
            onLoad={onSearchBoxLoad}
            onPlacesChanged={onPlacesChanged}
          >
            <InputGroup>
              <Input
                value={searchField}
                onChange={(e) => {
                  setSearchField(e.target.value);
                }}
                placeholder="Search for places"
                boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
                focusBorderColor="transparent"
                _focus={{
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <InputRightElement left="85%">
                <IconButton
                  icon={<SearchIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSearch();
                  }}
                />
                <Divider
                  my="1"
                  borderWidth="1px"
                  boxShadow="sm"
                  orientation="vertical"
                />
                <IconButton
                  icon={<CloseIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleClearField();
                  }}
                />
              </InputRightElement>
            </InputGroup>
          </StandaloneSearchBox>
        </Box>
        <Divider my="4" borderWidth="2px" boxShadow="md" />
        <Box>
          {nearbySights.map((item, index) => (
            <Popover
            offset={[0, 25]}
              key={index}
              trigger="hover"
              placement="right-start"
              closeOnBlur={false}
            >
              <PopoverTrigger>
                <Box>
                  <Text>{item.title}</Text>
                </Box>
              </PopoverTrigger>
              <Portal>
                <PopoverContent borderColor="transparent">
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <Box maxW="sm" bg="white" overflow="hidden">
                    <Image
                      src={
                        item.thumbnail
                          ? item.thumbnail.source
                          : "https://via.placeholder.com/150"
                      }
                      alt={item.title}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                    <Box p="6">
                      <Text>{item.extract}</Text>
                    </Box>
                  </Box>
                </PopoverContent>
              </Portal>
            </Popover>
          ))}
        </Box>
      </Box>
    </>
  ) : (
    <></>
  );
}

export default MainPage;
