import gql from "graphql-tag";

const DEPOSIT_FRAGMENT = gql`
  fragment DepositFields on Deposit {
    id
    amount
    user {
      id
    }
    lock
    endTimestamp
  }
`;

const TOKEN_FRAGMENT = gql`
  fragment TokenFields on Token {
    id
    name
    category
    contract
    image
    tokenId
    metadata {
      ... on LegionInfo {
        boost
      }
      ... on TreasureInfo {
        boost
      }
    }
  }
`;

export const getUserDeposits = gql`
  ${DEPOSIT_FRAGMENT}
  ${TOKEN_FRAGMENT}
  query getUserDeposits($id: ID!) {
    user(id: $id) {
      boost
      boosts
      deposits(where: { lock_not: null }) {
        ...DepositFields
      }
      staked(where: { mine_not: null }) {
        id
        quantity
        token {
          ...TokenFields
        }
      }
    }
    treasures: tokens(first: 50, where: { category: Treasure }) {
      ...TokenFields
    }
  }
`;

export const getAtlasMineTopDeposits = gql`
  ${DEPOSIT_FRAGMENT}
  query getAtlasMineTopDeposits($id: ID!, $first: Int!, $skip: Int!) {
    atlasMine(id: $id) {
      id
      deposits(
        first: $first
        skip: $skip
        orderBy: amount
        orderDirection: desc
      ) {
        ...DepositFields
      }
    }
  }
`;
