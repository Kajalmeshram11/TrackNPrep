import React from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";

const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = React.useState(false);
  const [explanation, setExplanation] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = React.useState(false);

  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try{
      const response= await axiosInstance.get(
      API_PATHS.SESSION.GET_ONE(sessionId)
    );

  if(response.data && response.data.session){
    setSessionData(response.data.session);
  }
}
 catch(error){
    console.error("Error:",error); 
  }
  };

  // Generate Concept Explanation
  const generateConceptExplanation = async (question) => {
    // TODO: implement API call
  };

  // Pin Question
  const toggleQuestionPinStatus = async (questionId) => {
    // TODO: implement API call
  };

  // Add more questions to a session
  const uploadMoreQuestions = async () => {
    // TODO: implement API call
  };

  React.useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
    return () => {};
  }, [sessionId]);

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "--"}
        questions={sessionData?.questions?.length || "--"}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("DD MMMM YYYY")
            : ""
        }
      />
<div className="conatiner mx-auto pt-4 pb-4 px-4 md:px-0">
  <h2 className="text-lg font-semibold">Interview Q & A</h2>
  <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
    <div className={`col-span-12 ${
      openLeanMoreDrawer ? "md: col-span-7" : "md: col-span-8"}`}>
<AnimatePresence>
{sessionData?.questions?.map((data, index) => {
return (
<motion.div
key={data._id || index}
initial={{opacity:0,y:-20}}
animate ={{opacity:1,y:0}}
exit={{opacity:0,scale:0.95}}
transition={{
  duration:0.4,
  type:"spring",
  stiffness: 100,
  delay:index*0.1,
  damping:15,
}}
layout //this is the key prop that aimates position changes
layoutId={`question-${data._id||index}`}
>
  <>
  <QuestionCard
  question={data?.question}
  answer={data?.answer}
  onLearnMore={()=>
    generateConceptExplanation(data.question)
  }
  isPinned={data?.isPinned}
  onTogglePin={()=>toggleQuestionPinStatus(data._id)}
  />
  </>
  </motion.div>
);
})}
</AnimatePresence>
</div>
</div>
</div>
</DashboardLayout>
  )
}

export default InterviewPrep
