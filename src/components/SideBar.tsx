import React, { useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Replace this with your custom fetch function
    fetch(`https://api.example.com/places?search=${search}`)
      .then((response) => response.json())
      .then((data) => setData(data));
  };

  return (
    <Box
      w="300px"
      bg="white"
      height="calc(100vh - 100px)" // <-- Here's the change
      boxShadow="lg"
      p="4"
      overflowY="scroll"
      position="fixed"
      left="0"
      top="70px"
      zIndex="1"
      borderRadius="10px"
    >
      <VStack spacing="4" width="50%">
        <Box width="100%">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search for places"
              value={search}
              onChange={handleSearchChange}
              onKeyPress={(event) => {
                if (event.key === "Enter") handleSearchSubmit(event);
              }}
              width="100%"
            />
          </InputGroup>
          <Divider my="4" borderWidth="2px" boxShadow="md" />
        </Box>
        <Box>
          {data.map((item) => (
            <h1></h1>
          ))}
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;
