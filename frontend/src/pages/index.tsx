import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "@reddit/frontend/utils/createUrqlClient";
import { usePostsQuery } from "generated/graphql";
import Navbar from "../components/Navbar";
import Container from "@material-ui/core/Container";

interface indexProps {}

const Index: React.FC<indexProps> = ({}) => {
  const [{ data }] = usePostsQuery();

  return (
    <div>
      <Navbar />
      <Container>
        {!data ? (
          <div>Loading...</div>
        ) : (
          data.posts.map(post => <div key={post.id}>{post.title}</div>)
        )}
      </Container>
    </div>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
