import {
  Avatar,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  useBoolean,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@client/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardBody, Field, Form, FormLayout, Loader } from "@saas-ui/react";
import ImageUploadWidget from "src/app/components/ImageUploadWidget";
import SaveChangesButton from "src/app/components/SaveChangesButton";
import { stripHtml } from "string-strip-html";
import { z } from "zod";

const ProfileIndex = () => {
  const schema = z.object({
    name: z.string().min(2),
    surname: z.string(),
    about: z.string().min(2),
    gender: z.enum(["Male", "Female"]),
    dateOfBirth: z.coerce.date(),
  });
  type ProfileForm = z.infer<typeof schema>;
  const [removeImageState, updateRemoveImageState] = useBoolean(false);

  const profile = trpc.profile.get.useQuery();
  const update = trpc.profile.update.useMutation();
  const updateAvatar = trpc.profile.updateAvatar.useMutation();
  const toast = useToast();

  if (profile.isLoading) return <Loader />;

  const onSubmit = (params: ProfileForm) => {
    console.log(params);
    update.mutate(params, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Your profile has been updated",
          status: "success",
          isClosable: true,
          position: "top-right",
        });
      },
    });
  };

  return (
    <Container maxW="container.md">
      <Heading mb={4}>Update Profile</Heading>
      <Card bg="bg.card" mb="2">
        <CardBody rounded="xl">
          <Center>
            <Avatar
              name={profile.data?.name}
              size="xl"
              mb={2}
              src={`https://imagedelivery.net/sdqQx4FWOKQ_S_S-shOoYw/avatars/${
                profile.data?.avatar ?? ""
              }/Thumbnail`}
            />
          </Center>
          <ImageUploadWidget
            pathPrefix="avatars"
            onSuccess={(imageId) => {
              updateAvatar.mutate({ imageId });
              console.log({ wow: imageId });
            }}
          />
          {removeImageState ? (
            <Button
              isLoading={updateAvatar.isLoading}
              onClick={() => {
                updateAvatar.mutate(
                  { imageId: "" },
                  {
                    onSettled: () => {
                      updateRemoveImageState.off();
                    },
                  }
                );
              }}
              variant="solid"
              colorScheme="red"
            >
              Are you sure?
            </Button>
          ) : (
            <Button onClick={() => updateRemoveImageState.on()} variant="ghost">
              Remove Image
            </Button>
          )}
        </CardBody>
      </Card>
      <Card bg="bg.card">
        <CardBody rounded="xl">
          <Form
            defaultValues={{
              name: profile.data?.name ?? "",
              surname: profile.data?.lastname ?? "",
              about: stripHtml(profile.data?.about ?? "").result,
              gender: (profile.data?.gender as z.infer<typeof schema>["gender"]) ?? "Male",
              dateOfBirth: z.coerce.date().catch(new Date()).parse(profile.data?.dob),
            }}
            onSubmit={onSubmit}
            resolver={zodResolver(schema)}
          >
            <FormLayout>
              <Flex gap={3}>
                <Field name="name" label="Name" type="text" />
                <Field name="surname" label="Surname" type="text" />
              </Flex>
              <Field
                type="native-select"
                name="gender"
                label="Gender"
                options={[{ value: "Male" }, { value: "Female" }]}
              />
              <Field
                type="date"
                name="dateOfBirth"
                label={
                  "Date of Birth " +
                  `(Current ${z.coerce
                    .date()
                    .catch(new Date())
                    .parse(profile.data?.dob)
                    .toISOString()
                    .slice(0, 10)})`
                }
              />

              <Field name="about" type="textarea" label="About" rows={12} />

              <SaveChangesButton isLoading={update.isLoading} />
            </FormLayout>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default ProfileIndex;
