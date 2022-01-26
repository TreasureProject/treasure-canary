import gql from "graphql-tag";

export const getAtlasMineTopDeposits = gql`
  query getAtlasMineTopDeposits($id: ID!, $first: Int!, $skip: Int!) {
    atlasMine(id: $id) {
      id
      deposits(first: $first, skip: $skip, orderBy: amount, orderDirection: desc) {
        id,
        amount,
        user {
          id
        },
        endTimestamp
      }
    }
  }
`;
